import {useState} from "react";
import { Search } from "lucide-react";

// Компонент пошуку
const SearchBar = ({ onSearch }) => {
    const [searchText, setSearchText] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchText);
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center">
            <input
                type="text"
                className="rounded-l-lg py-2 px-4 border-t border-b border-l text-gray-800 border-gray-200 bg-white focus:outline-none w-full"
                placeholder="Шукати опитування..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
            <button className="px-4 bg-blue-500 text-white font-bold p-2 rounded-r-lg border-blue-500 border-t border-b border-r" type="submit">
                <Search size={20} />
            </button>
        </form>
    );
};

export default SearchBar;