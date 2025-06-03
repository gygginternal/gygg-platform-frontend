import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns"; // Import date-fns for formatting dates
import apiClient from "../api/axiosConfig";
import styles from "./ContractsPage.module.css";
import { StatusBagde } from "../components/StatusBadge"; // Adjust the import path
import InputField from "../components/Shared/InputField";
import { Toggle } from "../components/Toggle"; // Import the Toggle component
import { TabNavigation } from "../components/TabNavigation"; // Import the new TabNavigation component
import { BillingTable } from "../components/BillingTable"; // Import the new BillingTable component

function JobListingsPage({ contracts }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-4">
        {contracts.map((job, index) => (
          <div key={index}>
            <JobListingItem job={job} />
            <hr className="mt-2" />
          </div>
        ))}
      </div>
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
        className="text-lg underline font-medium text-gray-800 hover:underline cursor-pointer"
      >
        {job.gigTitle}
      </Link>
      <div className="flex justify-between items-center mt-2">
        <div className="">
          <div className=" flex items-center">
            <span className="text-sm text-gray-500">Hired by</span>
            <div className="font-semibold ml-2">{job.provider}</div>
          </div>
          <div className=" flex items-center mt-5">
            <span className="text-sm text-gray-500">Contract ID</span>
            <div className="font-medium ml-2">{job.id}</div>
          </div>
        </div>
        <div className="flex flex-col">
          <StatusBagde status={job.status} />
          <div className="mt-2">
            <span className="text-sm text-gray-500">Started</span>
            <span className="ml-2">{formattedDate}</span>
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
    return <p>Loading contracts...</p>;
  }

  if (isError) {
    return <p>Error loading contracts: {error?.message || "Unknown error"}</p>;
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
    <div className="max-w-3xl mx-auto p-4 md:p-6">
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
          <div className="mt-5 mb-0">
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
              className="data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:border-blue-500  ml-3"
            >
              Completed
            </Toggle>
            <Toggle
              pressed={selectedStatuses.includes("active")}
              onPressedChange={() => toggleStatus("active")}
              variant="outline"
              size="sm"
              className="data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=on]:border-green-500  my-3 mx-3 "
            >
              Active
            </Toggle>
            <Toggle
              pressed={selectedStatuses.includes("cancelled")}
              onPressedChange={() => toggleStatus("cancelled")}
              variant="outline"
              size="sm"
              className="data-[state=on]:bg-red-500 data-[state=on]:text-white data-[state=on]:border-red-500  "
            >
              Cancelled
            </Toggle>
          </div>
          <JobListingsPage contracts={contracts} />
          {hasNextPage && (
            <div className="text-center mt-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {isFetchingNextPage ? "Loading more..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
      {activeTab === "billing" && <BillingTable rows={billingRows} />}
    </div>
  );
}

export default ContractsPage;
