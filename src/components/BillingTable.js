import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/axiosConfig"; // Adjust path as needed
import { format } from "date-fns"; // Import date-fns for formatting dates
import { BillingModal } from "./BillingModal";
import { Pagination } from "antd";
import "./BillingTable.css"; // Import your CSS file for styling

export const BillingTable = () => {
  const [selectedGig, setSelectedGig] = useState(null); // State to track selected gig for modal
  const [currentPage, setCurrentPage] = useState(1); // State to track the current page
  const [pageSize] = useState(10); // Number of items per page

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["payments", currentPage],
    queryFn: async () => {
      const response = await apiClient.get(
        `/payments?page=${currentPage}&limit=${pageSize}`
      );
      return response.data; // Assuming the API returns the full pagination structure
    },
    keepPreviousData: true, // Keep previous data while fetching new data
  });

  const handleCloseModal = () => {
    setSelectedGig(null); // Close the modal by clearing the selected gig
  };

  const handlePageChange = (page) => {
    setCurrentPage(page); // Update the current page
  };

  if (isLoading) {
    return <p>Loading payments...</p>;
  }

  if (isError) {
    return <p>Error loading payments: {error?.message || "Unknown error"}</p>;
  }

  const { payments } = data.data;
  const { total } = data;

  return (
    <>
      <div className="overflow-x-auto mt-5">
        {/* Billing Modal */}
        {selectedGig && (
          <BillingModal
            isOpen={!!selectedGig}
            onClose={handleCloseModal}
            gig={selectedGig}
          />
        )}
        <table className="table-auto w-full border-collapse border-t border-b border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-sm font-semibold text-gray-700">
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Hired by
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Date
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Contract detail
              </th>
              <th className="px-4 py-2 text-left border-b border-gray-300">
                Invoice
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                  No payments found.
                </td>
              </tr>
            )}
            {payments.map((row, index) => {
              return (
                <tr key={index} className="text-sm text-gray-700">
                  <td className="px-4 py-2 border-b border-gray-300">
                    {[row.payer.firstName, row.payer.lastName]
                      .filter(Boolean)
                      .join(" ")}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-300">
                    {format(new Date(row.createdAt), "MM-dd-yyyy")}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-300">
                    {row?.gig?.title || "N/A"}
                  </td>
                  <td
                    className="px-4 py-2 border-b border-gray-300 font-medium underline cursor-pointer "
                    onClick={() => setSelectedGig(row)} // Open modal with selected gig
                  >
                    View
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        className="mt-5"
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={handlePageChange}
        showSizeChanger={false} // Disable changing page size
      />
    </>
  );
};
