import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "../api/axiosConfig";

export const GigApplySection = ({ gigId, onApplySuccess }) => {
  // Fetch the current user's application for the gig
  const {
    data: application,
    isLoading: isApplicationLoading,
    isError,
    refetch: refetchApp,
  } = useQuery({
    queryKey: ["myApplication", gigId],
    queryFn: async () => {
      const response = await apiClient.get(`/gigs/${gigId}/my-application`);

      return response.data.data;
    },
    enabled: !!gigId, // Only fetch if gigId is available
  });

  // Mutation for applying to the gig
  const applyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/gigs/${gigId}/apply`);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Gig applied successfully:", data);
      refetchApp();
      if (onApplySuccess) {
        onApplySuccess(); // Notify parent component to refresh data
      }
    },
    onError: (err) => {
      console.error(
        "Error applying to gig:",
        err.response?.data || err.message
      );
    },
  });

  // Mutation for canceling the application
  const cancelMutation = useMutation({
    mutationFn: async (applicationId) => {
      await apiClient.patch(`/applications/${applicationId}/cancel`);
    },
    onSuccess: () => {
      console.log("Application canceled successfully.");
      refetchApp();
      if (onApplySuccess) {
        onApplySuccess(); // Notify parent component to refresh data
      }
    },
    onError: (err) => {
      console.error(
        "Error canceling application:",
        err.response?.data || err.message
      );
    },
  });

  if (isApplicationLoading) {
    return <p>Loading application status...</p>;
  }

  if (isError) {
    return <p>Error loading application status.</p>;
  }

  const isApplable = application && application.applicationStatus !== "pending";

  return (
    <div>
      <h1>Tasker</h1>
      {isApplable ? (
        <button
          onClick={() => applyMutation.mutate()}
          disabled={applyMutation.isLoading}
        >
          {applyMutation.isLoading ? "Applying..." : "Apply"}
        </button>
      ) : (
        <button
          onClick={() => cancelMutation.mutate(application.id)}
          disabled={cancelMutation.isLoading}
        >
          {cancelMutation.isLoading ? "Canceling..." : "Cancel Application"}
        </button>
      )}
    </div>
  );
};
