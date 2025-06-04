import { LampDesk } from "lucide-react";
import { Link } from "react-router-dom"; // Use react-router Link
import { useAuth } from "../context/AuthContext"; // Adjust path

export function TaskerMatchedSidebar() {
  const { user } = useAuth(); // Get logged-in user data
  return (
    <div className="bg-stone-50 min-h-screen justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm max-w-md w-full p-6 space-y-8">
        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden">
            <img
              src="/default.png"
              alt="Profile picture"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-slate-700 text-2xl font-medium">
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </h2>
            <Link
              to="/profile"
              href="#"
              className="text-slate-600 underline text-lg"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Awaiting Gigs Section */}
        {/* <div className="flex items-center gap-4">
          <div className="text-amber-500">
            <LampDesk size={32} />
          </div>
          <div>
            <h3 className="text-slate-700 text-xl font-medium">
              Awaiting posted gigs
            </h3>
            <a href="#" className="text-slate-600 underline text-lg">
              Need a dog sitter for the weekend
            </a>
          </div>
        </div> */}

        {/* Applicants Section */}
        <div className="space-y-4">
          {/* <div className="flex items-center gap-4">
            <div className="text-amber-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-slate-700 text-xl font-medium">
              3 People applied to your gig
            </h3>
          </div> */}

          {/* Applicant 1 */}
          {/* <div className="flex items-center gap-4 pl-10">
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              <img
                src="/default.png?height=64&width=64"
                alt="Applicant picture"
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-slate-600 text-lg">
                Ariana. A from Thornhill applied to dog sitter for a w...
              </p>
              <a href="#" className="text-slate-600 underline text-lg">
                View application
              </a>
            </div>
          </div> */}

          {/* Applicant 2 */}
          {/* <div className="flex items-center gap-4 pl-10">
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              <img
                src="/default.png"
                alt="Applicant picture"
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-slate-600 text-lg">
                Ariana. A from Thornhill applied to dog sitter for a w...
              </p>
              <a href="#" className="text-slate-600 underline text-lg">
                View application
              </a>
            </div>
          </div> */}

          {/* Applicant 3 */}
          {/* <div className="flex items-center gap-4 pl-10">
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              <img
                src="/default.png"
                alt="Applicant picture"
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-slate-600 text-lg">
                Ariana. A from Thornhill applied to dog sitter for a w...
              </p>
              <a href="#" className="text-slate-600 underline text-lg">
                View application
              </a>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
