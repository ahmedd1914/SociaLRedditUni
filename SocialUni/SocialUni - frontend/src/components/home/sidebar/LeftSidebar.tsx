import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { HiOutlineHome, HiOutlineTrendingUp, HiOutlineUsers, HiOutlineFilter } from "react-icons/hi";
import { BsCalendar3, BsNewspaper, BsBookmarkFill, BsChevronDown, BsChevronUp } from "react-icons/bs";
import { CiUser, CiBellOn } from "react-icons/ci";
import { IoBookOutline, IoCreateOutline } from "react-icons/io5";
import { TbMessages } from "react-icons/tb";
import { MdGroup, MdExplore } from "react-icons/md";
import { FiSettings, FiPlus } from "react-icons/fi";
import { GoHomeFill } from "react-icons/go";

// Categories for filtering
const CATEGORIES = [
  "Technology",
  "Science",
  "Sports",
  "Gaming",
  "Movies",
  "Music",
  "Art",
  "Food",
  "Education",
  "News",
];

// Sort options for posts
const SORT_OPTIONS = [
  { label: "Hot", value: "trending", icon: <HiOutlineTrendingUp /> },
  { label: "New", value: "new", icon: <IoCreateOutline /> },
  { label: "Top", value: "top", icon: <BsBookmarkFill /> },
];

const LeftSidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // If not logged in, show the guest sidebar
  if (!isAuthenticated) {
    return (
      <div className="pt-2 h-full">
        {/* Categories Section */}
        <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
          <h3 className="font-bold text-lg mb-3">Categories</h3>
          <div className="space-y-1">
            {CATEGORIES.slice(0, showAllCategories ? CATEGORIES.length : 5).map((category) => (
              <button 
                key={category}
                className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 text-base-content"
                onClick={() => navigate(`/home?category=${category}`)}
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-xs">
                  {category.charAt(0)}
                </span>
                {category}
              </button>
            ))}
            {!showAllCategories && (
              <button
                className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 text-primary"
                onClick={() => setShowAllCategories(true)}
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-xs">
                  <BsChevronDown className="text-primary" />
                </span>
                Show More Categories
              </button>
            )}
            {showAllCategories && (
              <button
                className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 text-primary"
                onClick={() => setShowAllCategories(false)}
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-xs">
                  <BsChevronUp className="text-primary" />
                </span>
                Show Less
              </button>
            )}
          </div>
        </div>
        
        {/* Resources Section */}
        <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
          <h3 className="font-bold text-lg mb-3">Resources</h3>
          <div className="space-y-1">
            <button 
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300"
              onClick={() => navigate("/resources")}
            >
              <IoBookOutline className="w-5 h-5 mr-2" />
              Study Materials
            </button>
            <button 
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300"
              onClick={() => navigate("/resources/tutorials")}
            >
              <MdExplore className="w-5 h-5 mr-2" />
              Tutorials
            </button>
            <button 
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300"
              onClick={() => navigate("/resources/events")}
            >
              <BsCalendar3 className="w-5 h-5 mr-2" />
              Events
            </button>
            <button 
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300"
              onClick={() => navigate("/resources/news")}
            >
              <BsNewspaper className="w-5 h-5 mr-2" />
              News
            </button>
          </div>
        </div>
        
        {/* About & Group Menu Section */}
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-3">About</h3>
          <p className="text-sm mb-4">
            Social Uni is a platform for university students to connect, share, and collaborate.
            Create an account to access all features.
          </p>
          
          <div className="border-t border-base-300 dark:border-slate-700 pt-4">
            <h3 className="font-bold text-lg mb-3">Join Our Community</h3>
            <div className="space-y-1">
              <button 
                className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300"
                onClick={() => navigate("/groups")}
              >
                <MdGroup className="w-5 h-5 mr-2" />
                Browse Groups
              </button>
              <button 
                className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300"
                onClick={() => navigate("/categories")}
              >
                <HiOutlineFilter className="w-5 h-5 mr-2" />
                Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Logged in user sidebar - Reddit style
  return (
    <div className="pt-2 h-full">
      {/* User profile section */}
      <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">{user?.username || 'User'}</h2>
            <span className="badge badge-ghost">{user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</span>
          </div>
        </div>
        <button 
          className="btn btn-sm btn-outline w-full mb-2 justify-start"
          onClick={() => navigate("/profile")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Profile
        </button>
        {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
          <button 
            className="btn btn-sm btn-outline btn-secondary w-full justify-start"
            onClick={() => navigate("/admin/home")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin Dashboard
          </button>
        )}
      </div>
      
      {/* Reddit-style Feeds */}
      <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Feeds</h3>
        <ul className="space-y-1">
          <li>
            <button 
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 font-medium"
              onClick={() => navigate("/home")}
            >
              <GoHomeFill className="w-5 h-5 mr-2" />
              Home
            </button>
          </li>
          <li>
            <button 
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300"
              onClick={() => navigate("/home?sort=popular")}
            >
              <HiOutlineTrendingUp className="w-5 h-5 mr-2" />
              Popular
            </button>
          </li>
          <li>
            <button 
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300"
              onClick={() => navigate("/notifications")}
            >
              <CiBellOn className="w-5 h-5 mr-2" />
              Notifications
              <span className="ml-auto badge badge-xs badge-primary"></span>
            </button>
          </li>
        </ul>
      </div>
      
      {/* Sort options section */}
      <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Sort By</h3>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button 
              key={option.value}
              className="btn btn-sm btn-outline"
              onClick={() => navigate(`/home?sort=${option.value}`)}
            >
              {React.cloneElement(option.icon, { className: "h-4 w-4 mr-1" })}
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Categories section */}
      <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Categories</h3>
        <div className="space-y-1">
          {CATEGORIES.map((category) => (
            <button 
              key={category}
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 text-base-content"
              onClick={() => navigate(`/home?category=${category}`)}
            >
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-xs">
                {category.charAt(0)}
              </span>
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* My Communities section */}
      <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
        <h3 className="font-bold text-lg mb-3">My Communities</h3>
        <div className="space-y-1">
          {/* Placeholder for user's communities */}
          <div className="text-center py-3 text-gray-500">
            <p>Your communities will appear here</p>
          </div>
          <button
            className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 text-primary"
            onClick={() => navigate("/groups")}
          >
            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-xs">
              <FiPlus className="text-primary" />
            </span>
            View All Communities
          </button>
        </div>
      </div>
      
      {/* Quick Actions section */}
      <div className="mb-4">
        <h3 className="font-bold text-lg mb-3">Create</h3>
        <div className="flex flex-col gap-2">
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => navigate("/posts/create")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Post
          </button>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => navigate("/groups/create")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Community
          </button>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => navigate("/events/create")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar; 