import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:hover:text-gray-600 transition"
      >
        <MdChevronLeft className="h-5 w-5" /> Previous
      </button>

      <span className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:hover:text-gray-600 transition"
      >
        Next <MdChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;
