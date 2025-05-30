import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/axiosConfig";
import { Badge } from "../components/Badge";
import { StatusBagde } from "../components/StatusBadge"; // Assuming you have a StatusBadge component

function ProviderCard({ provider, onOffer, onReject }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 h-48 relative">
          <img
            src={provider.image || "/placeholder.svg"}
            alt={`${provider.name}'s profile picture`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <StatusBagde
                className={"mb-2"}
                status={provider.status === "rejected" ? "Rejected" : "Active"}
              />
              <h2 className="text-xl font-semibold">{provider.name}</h2>
              <p className="text-amber-500 font-semibold">{provider.rate}</p>
              {provider.location &&
                provider.location.trim().split(",").filter(Boolean).length >
                  0 && (
                  <div className="flex items-center text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{provider.location}</span>
                  </div>
                )}
            </div>
          </div>
          <div>
            <button
              className="mr-3 w-[100px]"
              onClick={() => onOffer(provider.id)}
            >
              Offer
            </button>
            <button className="w-[100px]" onClick={() => onReject(provider.id)}>
              Reject
            </button>
          </div>

          <p className="text-gray-600 my-3 line-clamp-2">
            {provider.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            {provider.services.map((service) => (
              <Badge
                key={service}
                variant="outline"
                className="hover:bg-amber-200 border-amber-200 rounded-full px-4 py-1"
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const GigApplications = ({ onOffer, onReject }) => {
  const { gigId } = useParams(); // Get the gigId from the URL

  const queryClient = useQueryClient(); // React Query client for invalidating queries
  const [currentPage, setCurrentPage] = useState(1); // State for the current page
  const [applications, setApplications] = useState([]); // State for storing all applications
  const [hasMore, setHasMore] = useState(true); // State to track if more pages are available

  // Fetch applications with pagination
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["gigApplications", gigId, currentPage],
    queryFn: async () => {
      const response = await apiClient.get(
        `/gigs/${gigId}/applications?page=${currentPage}`
      );

      const data = response.data;
      if (data && data.data && data.data.applications) {
        setApplications((prev) => [...prev, ...data.data.applications]); // Append new applications
        setHasMore(currentPage < data.totalPages); // Check if more pages are available
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Fetched applications:", data);
    },
    enabled: !!gigId && hasMore, // Only fetch if gigId is available and more pages exist
  });

  // Mutation for offering an application
  const offerMutation = useMutation({
    mutationFn: async (applicationId) => {
      await apiClient.patch(`/applications/${applicationId}/offer`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["gigApplications", gigId]); // Refresh applications
    },
    onError: (err) => {
      console.error(
        "Error offering application:",
        err.response?.data || err.message
      );
    },
  });

  // Mutation for rejecting an application
  const rejectMutation = useMutation({
    mutationFn: async (applicationId) => {
      await apiClient.patch(`/applications/${applicationId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["gigApplications", gigId]); // Refresh applications
    },
    onError: (err) => {
      console.error(
        "Error rejecting application:",
        err.response?.data || err.message
      );
    },
  });

  const handleLoadMore = () => {
    if (hasMore) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleOffer = async (applicationId) => {
    await offerMutation.mutateAsync(applicationId); // Default behavior
    if (onOffer) {
      onOffer(applicationId); // Call the external onOffer handler
    }
  };

  const handleReject = async (applicationId) => {
    rejectMutation.mutate(applicationId); // Default behavior
    setApplications((prevApplications) =>
      prevApplications.map((application) =>
        application.id === applicationId
          ? { ...application, status: "rejected" }
          : application
      )
    );
  };

  if (isLoading && currentPage === 1) {
    return <p>Loading applications...</p>;
  }

  if (isError) {
    return (
      <p className="error-message">
        {error?.message || "Failed to load applications."}
      </p>
    );
  }

  if (applications.length === 0) {
    return <p>No applications found.</p>;
  }

  return (
    <div>
      <h1>Gig Applications</h1>
      <ul>
        {applications.map((application) => (
          <li key={application.id}>
            <ProviderCard
              provider={application}
              onOffer={handleOffer}
              onReject={handleReject}
            />
          </li>
        ))}
      </ul>
      {hasMore && (
        <button onClick={handleLoadMore} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};
