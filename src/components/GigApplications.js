import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/axiosConfig";
import { Badge } from "../components/Badge";
import { StatusBadge } from "../components/StatusBadge"; // Assuming you have a StatusBadge component
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";

function OfferCard({ offer, onDelete, onAccept, onDecline, isProvider }) {
  const provider = offer.provider || {}; // Assuming offer has a provider object

  return (
    <div className="bg-white overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 h-48 relative">
          <img
            src={offer.image || "/placeholder.svg"}
            alt={`${offer.name}'s profile picture`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <h2 className="text-xl font-semibold">{offer.name}</h2>
              <p className="text-amber-500 font-semibold">{offer.rate}</p>
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
            {isProvider ? (
              <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={() => onDelete(offer._id)}
              >
                Delete Offer
              </Button>
            ) : (
              <>
                <Button className="mr-3" onClick={() => onAccept(offer._id)}>
                  Accept Offer
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => onDecline(offer._id)}
                >
                  Decline Offer
                </Button>
              </>
            )}
          </div>

          <p className="text-gray-600 my-3 line-clamp-2">{offer.description}</p>

          <div className="flex flex-wrap gap-2 mt-2">
            {provider.skills.map((service) => (
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

function ProviderCard({ provider, onOffer, onReject }) {
  return (
    <div className="bg-white overflow-hidden">
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
              <StatusBadge
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
          <div className="flex flex-wrap gap-2  mb-5">
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
          <div>
            <Button className="mr-3" onClick={() => onOffer(provider.id)}>
              Send Offer
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={() => onReject(provider.id)}
            >
              Decline application
            </Button>
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
      console.info("Fetched applications:", data);
    },
    enabled: !!gigId && hasMore, // Only fetch if gigId is available and more pages exist
  });

  const offerMutation = useMutation({
    mutationFn: async (applicationId) => {
      await apiClient.post(`/applications/${applicationId}/offer`);
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

  // Fetch offers for the gig
  const {
    data: offerData,
    isLoading: isOfferLoading,
    isError: isOfferError,
    error: offerError,
  } = useQuery({
    queryKey: ["gigOffer", gigId],
    queryFn: async () => {
      const response = await apiClient.get(`/gigs/${gigId}/offer`);
      return response.data.data.offer; // Return the single offer
    },
    onSuccess: (data) => {
      console.info("Fetched offer:", data);
    },
  });

  // Mutation for deleting an offer
  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId) => {
      await apiClient.delete(`/offers/${offerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["gigOffers", gigId]); // Refresh offers
    },
    onError: (err) => {
      console.error("Error deleting offer:", err.response?.data || err.message);
    },
  });

  // Mutation for accepting an offer
  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId) => {
      await apiClient.patch(`/offers/${offerId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["gigOffers", gigId]); // Refresh offers
    },
    onError: (err) => {
      console.error(
        "Error accepting offer:",
        err.response?.data || err.message
      );
    },
  });

  // Mutation for declining an offer
  const declineOfferMutation = useMutation({
    mutationFn: async (offerId) => {
      await apiClient.patch(`/offers/${offerId}/decline`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["gigOffers", gigId]); // Refresh offers
    },
    onError: (err) => {
      console.error(
        "Error declining offer:",
        err.response?.data || err.message
      );
    },
  });

  const handleDeleteOffer = async (offerId) => {
    await deleteOfferMutation.mutateAsync(offerId);
    onOffer && onOffer(); // Call the external onOffer handler if provided
  };

  const handleAcceptOffer = async (offerId) => {
    await acceptOfferMutation.mutateAsync(offerId);
  };

  const handleDeclineOffer = async (offerId) => {
    await declineOfferMutation.mutateAsync(offerId);
  };

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

  const { user } = useAuth();
  const isProvider = user?.role?.includes("provider");

  if (isLoading && isOfferLoading && currentPage === 1) {
    return <p>Loading applications...</p>;
  }

  if (isError) {
    return (
      <p className="error-message">
        {error?.message || "Failed to load applications."}
      </p>
    );
  }

  if (applications.length === 0 && !offerData) {
    return <p>No applications or offers found.</p>;
  }

  return (
    <div>
      {!offerData && <h1>Gig Applications</h1>}
      <ul>
        {!offerData &&
          applications.map((application) => (
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

      {offerData && (
        <>
          <h1>Gig Offers</h1>
          <OfferCard
            offer={offerData}
            onDelete={handleDeleteOffer}
            onAccept={handleAcceptOffer}
            onDecline={handleDeclineOffer}
            isProvider={isProvider} // Dynamically determine if the user is the provider
          />
        </>
      )}
    </div>
  );
};
