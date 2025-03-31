import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from 'react-router-dom';

// Icons
import { HiOutlineHome, HiOutlineTrendingUp, HiOutlineUsers, HiOutlineUserGroup } from "react-icons/hi";
import { BsCalendar3, BsNewspaper, BsBookmarkFill } from "react-icons/bs";
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

const UserSidebar = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch user groups
  const groupsQuery = useQuery({
    queryKey: ["sidebar-groups"],
    queryFn: API.fetchAllGroups,
  });

  // If not logged in, show the guest sidebar
  if (!isAuthenticated) {
    return (
      <div className="pt-2 h-full">
        <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
          <h2 className="font-bold text-xl mb-4">Welcome, Guest!</h2>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-outline btn-primary">
              Create Account
            </Link>
          </div>
        </div>
        
        <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
          <h3 className="font-bold text-lg mb-3">Feeds</h3>
          <ul className="space-y-1">
            <li>
              <Link to="/home" className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 font-medium">
                <GoHomeFill className="w-5 h-5 mr-2" />
                Home
              </Link>
            </li>
            <li>
              <Link to="/home?sort=popular" className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300">
                <HiOutlineTrendingUp className="w-5 h-5 mr-2" />
                Popular
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
          <h3 className="font-bold text-lg mb-3">Categories</h3>
          <div className="space-y-1">
            {CATEGORIES.slice(0, 5).map((category) => (
              <Link 
                key={category}
                to={`/home?category=${category}`}
                className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 text-base-content"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-xs">
                  {category.charAt(0)}
                </span>
                {category}
              </Link>
            ))}
            <Link
              to="/categories"
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 text-primary"
            >
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-xs">
                <FiPlus className="text-primary" />
              </span>
              See More Categories
            </Link>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-3">About</h3>
          <p className="text-sm">
            Social Uni is a platform for university students to connect, share, and collaborate.
            Create an account to access all features.
          </p>
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
        <Link to="/profile" className="btn btn-sm btn-outline w-full mb-2 justify-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Profile
        </Link>
        {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
          <Link to="/admin/home" className="btn btn-sm btn-outline btn-secondary w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin Dashboard
          </Link>
        )}
      </div>
      
      {/* Reddit-style Feeds */}
      <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Feeds</h3>
        <ul className="space-y-1">
          <li>
            <Link to="/home" className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 font-medium">
              <GoHomeFill className="w-5 h-5 mr-2" />
              Home
            </Link>
          </li>
          <li>
            <Link to="/home?sort=popular" className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300">
              <HiOutlineTrendingUp className="w-5 h-5 mr-2" />
              Popular
            </Link>
          </li>
          <li>
            <Link to="/notifications" className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300">
              <CiBellOn className="w-5 h-5 mr-2" />
              Notifications
              <span className="ml-auto badge badge-xs badge-primary"></span>
            </Link>
          </li>
        </ul>
      </div>
      
      {/* Sort options section */}
      <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Sort By</h3>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <Link 
              key={option.value}
              to={`/home?sort=${option.value}`}
              className="btn btn-sm btn-outline"
            >
              {React.cloneElement(option.icon, { className: "h-4 w-4 mr-1" })}
              {option.label}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Categories section */}
      <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Categories</h3>
        <div className="space-y-1">
          {CATEGORIES.map((category) => (
            <Link 
              key={category}
              to={`/home?category=${category}`}
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 text-base-content"
            >
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-xs">
                {category.charAt(0)}
              </span>
              {category}
            </Link>
          ))}
        </div>
      </div>
      
      {/* My Communities section */}
      <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
        <h3 className="font-bold text-lg mb-3">My Communities</h3>
        <div className="space-y-1">
          {!groupsQuery.isLoading && groupsQuery.data && groupsQuery.data.slice(0, 5).map((group: any) => (
            <Link 
              key={group.id}
              to={`/groups/${group.id}`}
              className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300"
            >
              <span className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center mr-2 text-xs">
                <HiOutlineUserGroup className="w-3 h-3" />
              </span>
              {group.name}
            </Link>
          ))}
          <Link
            to="/groups"
            className="flex items-center px-2 py-1.5 w-full text-left rounded-lg hover:bg-base-300 text-primary"
          >
            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-xs">
              <FiPlus className="text-primary" />
            </span>
            View All Communities
          </Link>
        </div>
      </div>
      
      {/* Quick Actions section */}
      <div className="mb-4">
        <h3 className="font-bold text-lg mb-3">Create</h3>
        <div className="flex flex-col gap-2">
          <Link to="/posts/create" className="btn btn-sm btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Post
          </Link>
          <Link to="/groups/create" className="btn btn-sm btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Community
          </Link>
          <Link to="/events/create" className="btn btn-sm btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Event
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar; 