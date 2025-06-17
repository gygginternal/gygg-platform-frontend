import React, { useState } from "react";
// import cn from "classnames"; // No longer needed
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns"; // Import date-fns for formatting dates
import apiClient from "../api/axiosConfig";
import styles from '../components/ContractsPage/ContractsPage.module.css';
import ProfileSidebar from "../components/ProfileSidebar";
import { TabNavigation } from "../components/TabNavigation"; // Import the TabNavigation component
import InputField from "../components/Shared/InputField";
import Toggle from '../components/Toggle';
import BillingTable from '../components/Billing/BillingTable';
import { StatusBadge } from "../components/StatusBadge"; // Adjust the import path

function JobListingsPage({ contracts }) {
  return (
    <div className={styles.jobListingsContainer}>
      {contracts.map((job, index) => (
        <div key={index}>
          <JobListingItem job={job} />
          <hr className={styles.jobSeparator} />
        </div>
      ))}
    </div>
  );
}

function JobListingItem({ job }) {
  // Format the createdAt date
  const formattedDate = job.createdAt
    ? format(new Date(job.createdAt), "MM-dd-yyyy")
    : "N/A";

  return (
    <div>
      <Link
        to={`/gigs/${job.gigId}`}
        className={styles.jobTitleLink}
      >
        {job.gigTitle}
      </Link>
      <div className={styles.jobDetailsRow}>
        <div>
          <div className={styles.jobDetailItem}>
            <span className={styles.jobDetailLabel}>Hired by</span>
            <div className={styles.jobDetailValue}>{job.provider}</div>
          </div>
          <div className={styles.jobDetailItem + " " + styles.jobDetailItemMarginTop}>
            <span className={styles.jobDetailLabel}>Contract ID</span>
            <div className={styles.jobDetailValue}>{job.id}</div>
          </div>
        </div>
        <div className={styles.jobStatusContainer}>
          <StatusBadge status={job.status} />
          <div className={styles.jobDetailItem + " " + styles.jobDetailItemMarginTop}>
            <span className={styles.jobDetailLabel}>Started</span>
            <span className={styles.jobDetailValue}>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState(""); // State for input value
  const [searchValue, setSearchValue] = useState(""); // State for actual search query
  const [selectedStatuses, setSelectedStatuses] = useState([]); // State for selected statuses
  const [activeTab, setActiveTab] = useState("all"); // State for active tab

  // Fetch contracts using React Query's useInfiniteQuery
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["contracts", searchValue, selectedStatuses],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get(
        `/contracts/my-contracts?page=${pageParam}&search=${searchValue}&status=${selectedStatuses.join(
          ","
        )}`
      );
      return {
        contracts: response.data.data.contracts,
        nextPage: pageParam + 1,
        totalPages: response.data.data.totalPages,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return allPages.length < lastPage.totalPages
        ? lastPage.nextPage
        : undefined;
    },
  });

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setSearchValue(searchQuery); // Update the actual search query
    }
  };

  const toggleStatus = (status) => {
    setSelectedStatuses(
      (prevStatuses) =>
        prevStatuses.includes(status)
          ? prevStatuses.filter((s) => s !== status) // Remove status if already selected
          : [...prevStatuses, status] // Add status if not selected
    );
  };

  if (isLoading) {
    return <p className={styles.loadingMessage}>Loading contracts...</p>;
  }

  if (isError) {
    return <p className={styles.errorMessage}>Error loading contracts: {error?.message || "Unknown error"}</p>;
  }

  const contracts = data.pages.flatMap((page) => page.contracts); // Combine all pages of contracts

  // Example rows for the BillingTable
  const billingRows = [
    {
      hiredBy: "Justin.S",
      date: "Jun, 24, 2025",
      detail: "Dog sitting for the weekend...",
      invoice: "View",
    },
    {
      hiredBy: "Alice.J",
      date: "Jun, 25, 2025",
      detail: "Graphic design project...",
      invoice: "View",
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebarArea}>
          <ProfileSidebar />
        </aside>
        <main className={`${styles.mainFeedArea} ${styles.mainFeedAreaMarginLeft}`}>
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              { id: "all", label: "All Contracts" },
              { id: "billing", label: "Billing and Payment" },
            ]}
          />
          {activeTab === "all" && (
            <>
              <div className={styles.filterSection}>
                <InputField
                  name="search"
                  type="text"
                  placeholder="Search existing contract..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} // Update input value
                  onKeyDown={handleSearch} // Trigger search on Enter key press
                />
                Filter by Status:
                <Toggle
                  pressed={selectedStatuses.includes("completed")}
                  onPressedChange={() => toggleStatus("completed")}
                  variant="outline"
                  size="sm"
                  className={styles.toggleButton + " " + styles.toggleButtonCompleted}
                >
                  Completed
                </Toggle>
                <Toggle
                  pressed={selectedStatuses.includes("active")}
                  onPressedChange={() => toggleStatus("active")}
                  variant="outline"
                  size="sm"
                  className={styles.toggleButton + " " + styles.toggleButtonActive}
                >
                  Active
                </Toggle>
                <Toggle
                  pressed={selectedStatuses.includes("cancelled")}
                  onPressedChange={() => toggleStatus("cancelled")}
                  variant="outline"
                  size="sm"
                  className={styles.toggleButton + " " + styles.toggleButtonCancelled}
                >
                  Cancelled
                </Toggle>
              </div>
              <JobListingsPage contracts={contracts} />
              {hasNextPage && (
                <div className={styles.loadMoreContainer}>
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className={styles.loadMoreButton}
                  >
                    {isFetchingNextPage ? "Loading more..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
          {activeTab === "billing" && <BillingTable rows={billingRows} />}
        </main>
      </div>
    </div>
  );
}

export default ContractsPage;
