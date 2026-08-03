import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "./icons";

export function BackButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`-ml-2 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${className}`}
    >
      <ChevronLeftIcon className="h-5 w-5" />
      <span className="hidden sm:inline">Retour</span>
    </button>
  );
}
