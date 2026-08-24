import { MdSearch } from "react-icons/md";

const SearchInput = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="relative w-full md:w-72">
    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 pl-10 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    />
  </div>
);

export default SearchInput;
