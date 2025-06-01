import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns"; // Import date-fns for formatting dates
import apiClient from "../api/axiosConfig";
import styles from "./ContractsPage.module.css";
// import "./ContractPage.css";
import { StatusBagde } from "../components/StatusBadge"; // Adjust the import path
import InputField from "../components/Shared/InputField";
import { Toggle } from "../components/Toggle"; // Import the Toggle component

function JobListingsPage({ contracts }) {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
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
        className="text-lg font-medium text-gray-800 hover:underline cursor-pointer"
      >
        {job.gigTitle}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 mt-3">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Hired by</span>
          <span className="font-medium">{job.provider}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3">
        <div>
          <span className="text-sm text-gray-500">Started</span>
          <span className="ml-2">{formattedDate}</span>
        </div>

        <StatusBagde status={job.status} />
      </div>
    </div>
  );
}

function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [selectedStatuses, setSelectedStatuses] = useState([]); // State for selected statuses

  // Fetch contracts using React Query's useInfiniteQuery
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["myContracts", searchQuery, selectedStatuses],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get(
        `/contracts/my-contracts?page=${pageParam}&search=${searchQuery}&status=${selectedStatuses.join(
          ","
        )}`
      );
      return {
        contracts: response.data.data.contracts,
        nextPage: pageParam + 1,
      }; // Increment page manually
    },
    getNextPageParam: (lastPage) => {
      return lastPage.contracts.length > 0 ? lastPage.nextPage : undefined; // Stop when no more contracts
    },
  });

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      refetch(); // Refetch contracts with the updated search query
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

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="mb-0">
        <InputField
          name="search"
          type="text"
          placeholder="Search existing contract..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
          onKeyDown={handleSearch} // Trigger search on Enter key press
        />
        Filter by Status:
        <Toggle
          pressed={selectedStatuses.includes("completed")}
          onPressedChange={() => {
            toggleStatus("completed");
            refetch(); // Refetch contracts when toggling
          }}
          variant="outline"
          size="sm"
          className="data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:border-blue-500  ml-3"
        >
          Completed
        </Toggle>
        <Toggle
          pressed={selectedStatuses.includes("active")}
          onPressedChange={() => {
            toggleStatus("active");
            refetch(); // Refetch contracts when toggling
          }}
          variant="outline"
          size="sm"
          className="data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=on]:border-green-500  my-3 mx-3 "
        >
          Active
        </Toggle>
        <Toggle
          pressed={selectedStatuses.includes("cancelled")}
          onPressedChange={() => {
            toggleStatus("cancelled");
            refetch(); // Refetch contracts when toggling
          }}
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
    </div>
  );
}

export default ContractsPage;
