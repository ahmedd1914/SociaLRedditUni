import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";
import NewsFeed from "./components/NewsFeed.tsx";


function App() {
    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <NewsFeed userId={0} />
                <RightSidebar />
            </div>
        </div>
    );
}

export default App;
