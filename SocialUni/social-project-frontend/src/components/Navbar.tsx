import { FaSearch } from "react-icons/fa";

const Navbar = () => {
    return (
        <nav className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Social Uni</h1>
    <div className="flex items-center bg-gray-700 px-3 py-1 rounded-lg">
    <FaSearch className="text-gray-400" />
    <input
        type="text"
    placeholder="Search..."
    className="bg-transparent ml-2 outline-none text-white"
        />
        </div>
        <button className="bg-blue-500 px-4 py-1 rounded-lg">Log In</button>
    </nav>
);
};

export default Navbar;
