import React from "react";
import { useAuth } from "../contexts/AuthContext";
import HomeFeed from '../components/home/HomeFeed';
import RightSidebar from '../components/home/sidebar/RightSidebar';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-9">
          <HomeFeed />
            </div>
            
        {/* Right Sidebar */}
        <div className="col-span-3">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default Home;
