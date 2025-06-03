import { MapPin, User, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Link } from "react-router-dom";
import { format } from "date-fns"; // Import date-fns for formatting dates

export function ContractDetailsPage({ gig, children }) {
  if (!gig) return;
  const formattedDate = gig.createdAt
    ? format(new Date(gig.createdAt), "MM-dd-yyyy")
    : "N/A";
  return (
    <div className="mx-auto p-4 ml-[200px]">
      <Link
        variant="ghost"
        className="mb-4 p-2 h-auto text-gray-600 hover:text-gray-900 bg-white flex items-center"
        to={{
          pathname: "/contracts",
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to contract list
      </Link>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              {gig.title}
            </h1>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Hired by</span>
              <span className="text-sm font-medium text-blue-600">
                {[gig.postedBy?.firstName, gig.postedBy?.lastName]
                  .filter(Boolean)
                  .join(" ")}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-700 leading-relaxed">
            <em>{gig.title}</em>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Started</span>
              <span className="text-sm font-medium">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fee</span>
              <span className="text-sm font-medium text-orange-600">
                ${gig.cost}
              </span>
            </div>

            {/* <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Deadline</span>
              <span className="text-sm font-medium">
                {details.duration} hours
              </span>
            </div> */}
          </div>

          {children}

          {/* <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 bg-gray-800 hover:bg-gray-900"
              onClick={onSubmitComplete}
            >
              Submit as Complete
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onEndContract}
            >
              End Contract
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
