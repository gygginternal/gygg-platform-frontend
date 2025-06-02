import { cn } from "../uitls/cn";

const statusConfig = {
  completed: {
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  active: {
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  cancelled: {
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
  rejected: {
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
};

export function StatusBagde({ status, className }) {
  const config = statusConfig[status.toLowerCase()];

  return (
    <span
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-lg border text-sm font-medium ml-auto",
        config?.bgColor,
        config?.textColor,
        config?.borderColor,
        className
      )}
    >
      {status}
    </span>
  );
}
