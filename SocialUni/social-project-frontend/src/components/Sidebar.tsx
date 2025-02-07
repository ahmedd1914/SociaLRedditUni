import { FaFire, FaGamepad, FaTv, FaGlobe, FaQuestionCircle } from "react-icons/fa";

const Sidebar = () => {
    return (
        <aside className="w-60 bg-gray-900 p-4 text-white h-screen">
            <h2 className="text-lg font-bold mb-4">Popular</h2>
            <ul className="space-y-3">
                <li className="flex items-center gap-2"><FaFire /> Trending</li>
                <li className="flex items-center gap-2"><FaGlobe /> Internet Culture</li>
                <li className="flex items-center gap-2"><FaGamepad /> Games</li>
                <li className="flex items-center gap-2"><FaTv /> Movies & TV</li>
                <li className="flex items-center gap-2"><FaQuestionCircle /> Q&A</li>
            </ul>
        </aside>
    );
};

export default Sidebar;
