import { MapPin } from "lucide-react";
import { Badge } from "../components/Badge";

export function ServiceProviderListing({ gigHelpers }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-4">
        {gigHelpers.length > 0 ? (
          gigHelpers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))
        ) : (
          <p className="text-gray-500">No Tasker Found.</p>
        )}
      </div>
    </div>
  );
}

export function ProviderCard({ provider }) {
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
              <h2 className="text-xl font-semibold">{provider.name}</h2>
              <p className="text-amber-500 font-semibold">{provider.rate}</p>
              {provider.location && (
                <div className="flex items-center text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{provider.location}</span>
                </div>
              )}
            </div>
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
