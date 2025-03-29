import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../api/interfaces";
import {
  fetchAllPosts,
  fetchTrendingPosts,
  fetchAllGroups,
  fetchPostsByDateRange,
  filterPostsByCategory,
} from "../api/ApiCollection";
import { HiOutlineTrendingUp, HiOutlineFire, HiOutlineFilter } from "react-icons/hi";
import { BsBookmark, BsCalendar3, BsArrowDown, BsArrowUp } from "react-icons/bs";
import { FaRegCommentAlt, FaRegThumbsUp, FaRegThumbsDown } from "react-icons/fa";
import { IoCreateOutline } from "react-icons/io5";
import { MdOutlineFilterList, MdOutlineWhatshot } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

// Sort options for posts
const SORT_OPTIONS = [
  { 
    label: "Hot", 
    value: "trending", 
    icon: <MdOutlineWhatshot className="text-orange-500" />,
    description: "Posts gaining popularity now"
  },
  { 
    label: "New", 
    value: "new", 
    icon: <IoCreateOutline className="text-blue-500" />,
    description: "Recently created posts"
  },
  { 
    label: "Top", 
    value: "top", 
    icon: <HiOutlineFire className="text-red-500" />,
    description: "Most upvoted posts"
  },
  { 
    label: "Rising", 
    value: "rising", 
    icon: <BsArrowUp className="text-green-500" />,
    description: "Posts with increasing engagement"
  }
];

// Time filter options
const TIME_FILTERS = [
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" }
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get params from URL
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort') || "trending";
  const timeParam = searchParams.get('time') || "all";
  
  // Local state
  const [activeTab, setActiveTab] = useState(sortParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [timeFilter, setTimeFilter] = useState(timeParam);
  const [showFilters, setShowFilters] = useState(false);
  
  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (activeTab !== "trending") {
      newParams.set("sort", activeTab);
    }
    
    if (selectedCategory) {
      newParams.set("category", selectedCategory);
    }
    
    if (timeFilter !== "all") {
      newParams.set("time", timeFilter);
    }
    
    setSearchParams(newParams, { replace: true });
  }, [activeTab, selectedCategory, timeFilter, setSearchParams]);

  // Update local state when URL params change
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (sortParam) {
      setActiveTab(sortParam);
    }
    
    if (timeParam) {
      setTimeFilter(timeParam);
    }
  }, [categoryParam, sortParam, timeParam]);

  // Remove token validation code so the page works without authentication
  // Instead, check if user is logged in to determine what content to show
  const isLoggedIn = Boolean(user);
  
  // Only fetch data if user is logged in
  // For guests, we'll show a limited version with prompts to login
  const allPostsQuery = useQuery({
    queryKey: ["allposts"],
    queryFn: fetchAllPosts,
    enabled: true // Always fetch public posts
  });

  // Fetch trending posts
  const trendingPostsQuery = useQuery({
    queryKey: ["trendingposts"],
    queryFn: fetchTrendingPosts,
    enabled: activeTab === "trending",
  });

  // Fetch groups for sidebar - only if logged in
  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: fetchAllGroups,
    enabled: isLoggedIn, // Only fetch if logged in
  });

  // Fetch posts by category if a category is selected
  const categoryPostsQuery = useQuery({
    queryKey: ["categoryPosts", selectedCategory],
    queryFn: () => filterPostsByCategory(selectedCategory),
    enabled: !!selectedCategory,
  });
  
  // Fetch posts by date range based on time filter
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch (timeFilter) {
      case "day":
        start.setDate(now.getDate() - 1);
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "year":
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setFullYear(2000); // Far in the past for "all time"
    }
    
    return { start: start.toISOString(), end: now.toISOString() };
  };
  
  const dateRangeQuery = useQuery({
    queryKey: ["dateRangePosts", timeFilter],
    queryFn: () => {
      const { start, end } = getDateRange();
      return fetchPostsByDateRange(start, end);
    },
    enabled: timeFilter !== "all" && !selectedCategory,
  });

  // Get posts based on active tab and filters
  const getDisplayPosts = () => {
    // First prioritize category filter
    if (selectedCategory && categoryPostsQuery.data) {
      const posts = [...categoryPostsQuery.data];
      
      // Apply sorting
      switch (activeTab) {
        case "trending":
          return posts.sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0));
        case "new":
          return posts.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "top":
          return posts.sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0));
        case "rising":
          // Simple rising algorithm: reactions / age in hours
          return posts.sort((a, b) => {
            const aAge = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
            const bAge = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
            const aScore = (a.reactionCount || 0) / Math.max(1, aAge);
            const bScore = (b.reactionCount || 0) / Math.max(1, bAge);
            return bScore - aScore;
          });
        default:
          return posts;
      }
    }
    
    // Then prioritize time filter
    if (timeFilter !== "all" && dateRangeQuery.data) {
      const posts = [...dateRangeQuery.data];
      
      switch (activeTab) {
        case "trending":
          return posts.sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0));
        case "new":
          return posts.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "top":
          return posts.sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0));
        case "rising":
          // Simple rising algorithm: reactions / age in hours
          return posts.sort((a, b) => {
            const aAge = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
            const bAge = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
            const aScore = (a.reactionCount || 0) / Math.max(1, aAge);
            const bScore = (b.reactionCount || 0) / Math.max(1, bAge);
            return bScore - aScore;
          });
        default:
          return posts;
      }
    }
    
    // Finally, apply basic sorting
    switch (activeTab) {
      case "trending":
        return trendingPostsQuery.data || [];
      case "new":
        return allPostsQuery.data ? 
          [...allPostsQuery.data].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ) : [];
      case "top":
        return allPostsQuery.data ? 
          [...allPostsQuery.data].sort((a, b) => 
            (b.reactionCount || 0) - (a.reactionCount || 0)
          ) : [];
      case "rising":
        return allPostsQuery.data ? 
          [...allPostsQuery.data].sort((a, b) => {
            const aAge = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
            const bAge = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
            const aScore = (a.reactionCount || 0) / Math.max(1, aAge);
            const bScore = (b.reactionCount || 0) / Math.max(1, bAge);
            return bScore - aScore;
          }) : [];
      default:
        return allPostsQuery.data || [];
    }
  };
  
  // Post handling and loading states
  const posts = getDisplayPosts();
  const topPosts = allPostsQuery.data ? 
    [...allPostsQuery.data]
      .sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0))
      .slice(0, 4) : 
    [];
    
  const isLoading = 
    allPostsQuery.isLoading || 
    (activeTab === "trending" && trendingPostsQuery.isLoading) ||
    (timeFilter !== "all" && dateRangeQuery.isLoading) ||
    (!!selectedCategory && categoryPostsQuery.isLoading);
    
  // Handle post reaction - requires login
  const handleReaction = (postId: number, isUpvote: boolean) => {
    if (!isLoggedIn) {
      toast.error("Please login to react to posts");
      navigate('/login');
      return;
    }
    
    console.log(`${isUpvote ? 'Upvoted' : 'Downvoted'} post ${postId}`);
    // In a real implementation, this would use a mutate function from react-query
    // to update the reaction and then invalidate the posts queries
  };

  return (
    <div className="home-container bg-base-200 min-h-screen">
      <div className="w-full mx-auto pt-4 px-2">
        {/* Two-column layout: Main content and right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Main content area - 3/4 width on large screens */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Page Title */}
            <div className="bg-base-100 rounded-xl shadow-md p-4">
              <div className="flex flex-wrap items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {selectedCategory ? `${selectedCategory} Posts` : "Home Feed"}
                </h2>
                {isLoggedIn ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate("/posts/create")}
                  >
                    Create Post
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="btn btn-primary">Sign In</Link>
                    <Link to="/register" className="btn btn-outline btn-primary">Register</Link>
                  </div>
                )}
              </div>
              
              {/* Guest welcome message - more prominent and informative */}
              {!isLoggedIn && (
                <div className="mt-4 p-5 bg-base-200 rounded-lg border-l-4 border-primary">
                  <h3 className="text-lg font-semibold mb-2">Welcome to Social Uni!</h3>
                  <p className="text-base-content mb-2">
                    Join our university social platform to connect with peers, share ideas, and stay updated on campus events.
                  </p>
                  <ul className="list-disc pl-5 mb-3 text-sm">
                    <li>Post and react to content</li>
                    <li>Join study groups and discussions</li>
                    <li>Stay connected with campus events</li>
                    <li>Create your own communities</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Sort and Filter bar - Reddit Style */}
            <div className="bg-base-100 rounded-xl shadow-md">
              {/* Sort options */}
              <div className="p-2 border-b border-base-300 flex flex-wrap items-center">
                <div className="flex overflow-x-auto hide-scrollbar">
                  {SORT_OPTIONS.map((option) => (
                    <button 
                      key={option.value}
                      className={`flex items-center px-3 py-2 rounded-full mr-2 ${
                        activeTab === option.value 
                          ? "bg-primary text-primary-content" 
                          : "hover:bg-base-200"
                      }`}
                      onClick={() => setActiveTab(option.value)}
                      title={option.description}
                    >
                      <span className="mr-1.5">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
                
                <div className="ml-auto">
                  <button 
                    className={`flex items-center px-3 py-2 rounded-full ${
                      showFilters ? "bg-primary text-primary-content" : "hover:bg-base-200"
                    }`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <HiOutlineFilter className="mr-1.5" />
                    Filters
                  </button>
                </div>
              </div>
              
              {/* Expanded filters */}
              {showFilters && (
                <div className="p-4 border-b border-base-300">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Time filter */}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-2">Time Period</h3>
                      <div className="flex flex-wrap gap-2">
                        {TIME_FILTERS.map((filter) => (
                          <button
                            key={filter.value}
                            className={`btn btn-sm ${
                              timeFilter === filter.value 
                                ? "btn-primary" 
                                : "btn-outline"
                            }`}
                            onClick={() => setTimeFilter(filter.value)}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Category filter */}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-2">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`btn btn-sm ${!selectedCategory ? "btn-primary" : "btn-outline"}`}
                          onClick={() => setSelectedCategory("")}
                        >
                          All
                        </button>
                        {["Technology", "Science", "Gaming", "Sports", "Art"].map((category) => (
                          <button
                            key={category}
                            className={`btn btn-sm ${
                              selectedCategory === category 
                                ? "btn-primary" 
                                : "btn-outline"
                            }`}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </button>
                        ))}
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => navigate("/categories")}
                        >
                          More...
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Top posts section */}
            {!selectedCategory && activeTab !== "top" && (
              <div className="bg-base-100 rounded-xl shadow-md p-4">
                <h3 className="text-xl font-semibold mb-4">Top Posts</h3>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : topPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topPosts.map((post) => (
                      <div 
                        key={post.id} 
                        className="bg-base-200 rounded-lg p-3 cursor-pointer hover:bg-base-300 transition-colors" 
                        onClick={() => navigate(`/posts/${post.id}`)}
                      >
                        <div className="flex items-center mb-2">
                          <div className="avatar mr-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                              {post.username.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <p className="text-sm font-medium">{post.username}</p>
                        </div>
                        <h4 className="text-base font-semibold mb-1 line-clamp-1">{post.title}</h4>
                        <p className="text-sm text-base-content/80 line-clamp-2 mb-2">{post.content}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            {post.reactionCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaRegCommentAlt className="h-3 w-3" />
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4">No top posts available</p>
                )}
              </div>
            )}
            
            {/* Recent/trending posts section */}
            <div className="bg-base-100 rounded-xl shadow-md p-4">
              <h3 className="text-xl font-semibold mb-4">
                {selectedCategory 
                  ? `${selectedCategory} Posts` 
                  : activeTab === "trending" 
                    ? "Hot Posts" 
                    : activeTab === "new" 
                      ? "New Posts" 
                      : activeTab === "rising"
                        ? "Rising Posts"
                        : "Top Posts"}
                {timeFilter !== "all" && !selectedCategory && (
                  <span className="text-sm font-normal ml-2 text-base-content/70">
                    - {TIME_FILTERS.find(f => f.value === timeFilter)?.label}
                  </span>
                )}
              </h3>
              
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-base-200 rounded-xl p-4 hover:bg-base-300 transition-colors">
                      {/* Post header with voting buttons - Reddit Style */}
                      <div className="flex gap-2">
                        {/* Vote buttons */}
                        <div className="flex flex-col items-center">
                          <button 
                            className="p-1 hover:bg-base-300 rounded-lg text-gray-500 hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReaction(post.id, true);
                            }}
                          >
                            <BsArrowUp className="text-xl" />
                          </button>
                          <span className="text-sm font-semibold my-1">{post.reactionCount || 0}</span>
                          <button 
                            className="p-1 hover:bg-base-300 rounded-lg text-gray-500 hover:text-error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReaction(post.id, false);
                            }}
                          >
                            <BsArrowDown className="text-xl" />
                          </button>
                        </div>
                        
                        {/* Post content */}
                        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/posts/${post.id}`)}>
                          <div className="flex items-center mb-2">
                            <div className="avatar mr-3">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                {post.username.charAt(0).toUpperCase() || "U"}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">{post.username || "Unknown User"}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString()} · 
                                {post.groupId ? ` in ${groupsQuery.data?.find(g => g.id === post.groupId)?.name || 'Unknown Group'}` : ' Public'}
                              </p>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                          <p className="text-base-content mb-3 line-clamp-3">{post.content}</p>
                          
                          {post.image && (
                            <div className="mb-3 rounded-lg overflow-hidden">
                              <img 
                                src={post.image} 
                                alt={post.title} 
                                className="w-full h-auto max-h-48 object-cover"
                              />
                            </div>
                          )}
                          
                          {post.category && (
                            <div className="mb-2">
                              <span 
                                className="badge badge-primary cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCategory(post.category);
                                }}
                              >
                                {post.category}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-1 text-sm">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-gray-500 hover:text-primary cursor-pointer">
                                <FaRegCommentAlt className="mr-1 h-3 w-3" />
                                <span>{post.comments?.length || 0} Comments</span>
                              </div>
                              <div className="flex items-center text-gray-500 hover:text-primary cursor-pointer">
                                <FaRegThumbsUp className="mr-1 h-3 w-3" />
                                <span>Like</span>
                              </div>
                              <div className="flex items-center text-gray-500 hover:text-primary cursor-pointer">
                                <FaRegThumbsDown className="mr-1 h-3 w-3" />
                                <span>Dislike</span>
                              </div>
                            </div>
                            <button className="text-gray-500 hover:text-primary">
                              <BsBookmark />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-base-200 rounded-xl p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                  <p className="text-gray-500 mb-4">Be the first to post in this category!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate("/posts/create")}
                  >
                    Create Post
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right sidebar - 1/4 width on large screens */}
          <div className="lg:col-span-1 space-y-5">
            {/* Guest Call-to-Action */}
            {!isLoggedIn && (
              <div className="bg-primary text-primary-content rounded-xl shadow-md p-4">
                <h3 className="text-lg font-semibold mb-2">Join Social Uni</h3>
                <p className="mb-3">Create an account to join groups, post content, and connect with others.</p>
                <div className="flex gap-2">
                  <Link to="/login" className="btn btn-sm btn-accent flex-1">Login</Link>
                  <Link to="/register" className="btn btn-sm btn-ghost bg-primary-focus flex-1">Register</Link>
                </div>
              </div>
            )}
            
            {/* Popular Groups - only show to logged-in users */}
            {isLoggedIn ? (
              <div className="bg-base-100 rounded-xl shadow-md p-4">
                <h3 className="text-lg font-semibold mb-3">Popular Groups</h3>
                {groupsQuery.isLoading ? (
                  <div className="flex justify-center">
                    <span className="loading loading-spinner loading-md"></span>
                  </div>
                ) : groupsQuery.data && groupsQuery.data.length > 0 ? (
                  <ul className="space-y-3">
                    {groupsQuery.data
                      .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
                      .slice(0, 5)
                      .map((group) => (
                        <li key={group.id} className="border-b border-base-300 pb-3 last:border-none last:pb-0">
                          <button 
                            className="flex items-center w-full hover:bg-base-200 p-2 rounded-lg"
                            onClick={() => navigate(`/groups/${group.id}`)}
                          >
                            <div className="avatar mr-3">
                              <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                {group.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{group.name}</p>
                              <p className="text-xs text-gray-500">{group.memberCount || 0} members</p>
                            </div>
                            <button 
                              className="btn btn-xs btn-outline btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                // This would be a join group API call
                                console.log(`Join group ${group.id}`);
                              }}
                            >
                              Join
                            </button>
                          </button>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-3">No groups available</p>
                )}
                <div className="mt-3 flex justify-between">
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => navigate("/groups")}
                  >
                    View All
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate("/groups/create")}
                  >
                    Create Group
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-base-100 rounded-xl shadow-md p-4">
                <h3 className="text-lg font-semibold mb-3">Popular Groups</h3>
                <p className="text-center text-gray-500 py-3">Login to see and join groups</p>
              </div>
            )}

            {/* Show public events to everyone */}
            <div className="bg-base-100 rounded-xl shadow-md p-4">
              <h3 className="text-lg font-semibold mb-3">Campus Events</h3>
              <ul className="space-y-2">
                <li className="border-b border-base-300 pb-2">
                  <p className="font-medium">Spring Festival</p>
                  <p className="text-xs text-gray-500">Tomorrow, 3:00 PM • Main Campus</p>
                </li>
                <li className="border-b border-base-300 pb-2">
                  <p className="font-medium">Tech Talk: AI Innovations</p>
                  <p className="text-xs text-gray-500">Wed, 5:00 PM • Engineering Building</p>
                </li>
                <li>
                  <p className="font-medium">Basketball Tournament</p>
                  <p className="text-xs text-gray-500">Fri, 2:00 PM • Sports Center</p>
                </li>
              </ul>
              <button 
                className="btn btn-sm btn-ghost w-full mt-3"
                onClick={() => isLoggedIn ? navigate("/events") : navigate("/login")}
              >
                {isLoggedIn ? "View All Events" : "Login to View More"}
              </button>
            </div>
            
            {/* Community Guidelines - show to everyone */}
            <div className="bg-base-100 rounded-xl shadow-md p-4">
              <h3 className="text-lg font-semibold mb-3">Community Guidelines</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Be respectful to other members</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>No spam or self-promotion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Post in relevant categories</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Follow the group-specific rules</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
