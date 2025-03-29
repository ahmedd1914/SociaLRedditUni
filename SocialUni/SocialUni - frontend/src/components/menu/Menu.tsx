import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { CiUser, CiBellOn } from "react-icons/ci";
import { HiOutlineHome, HiOutlineTrendingUp } from "react-icons/hi";
import { MdOutlineExplore, MdGroup } from "react-icons/md";
import { BsCalendar3, BsNewspaper } from "react-icons/bs";
import { IoBookOutline } from "react-icons/io5";
import { TbMessages } from "react-icons/tb";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchAllGroups } from "../../api/ApiCollection";

const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("");
  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";
  
  // Fetch groups for sidebar
  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: fetchAllGroups,
  });

  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
  }, [location.pathname]);

  // Categories for filtering
  const categories = [
    "Technology",
    "Science",
    "Sports",
    "Gaming",
    "Movies",
    "Music",
    "Art",
    "Food",
  ];

  // Resources links
  const resources = [
    { name: "Campus News", icon: <BsNewspaper />, path: "/news" },
    { name: "Academic Resources", icon: <IoBookOutline />, path: "/resources" },
    { name: "Messages", icon: <TbMessages />, path: "/messages" },
  ];

  return (
    <div className="w-full h-full overflow-auto pb-4">
      {/* Main navigation */}
      <div className="mb-6">
        <h3 className="font-medium text-base-content/60 text-sm mb-2 px-2">Main</h3>
        <ul className="space-y-1">
          <li>
            <NavLink
              to={isAdmin ? "/admin/home" : "/home"}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                  isActive || activeItem === "/home" || activeItem === "/admin/home"
                    ? "bg-base-300 text-primary font-medium"
                    : "text-base-content"
                }`
              }
            >
              <HiOutlineHome className="mr-2" />
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/posts"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                  isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                }`
              }
            >
              <HiOutlineTrendingUp className="mr-2" />
              Trending
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                  isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                }`
              }
            >
              <BsCalendar3 className="mr-2" />
              Events
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                  isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                }`
              }
            >
              <CiUser className="mr-2" />
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                  isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                }`
              }
            >
              <CiBellOn className="mr-2" />
              Notifications
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Recent/Popular Groups */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="font-medium text-base-content/60 text-sm">Groups</h3>
          <button
            onClick={() => navigate("/groups")}
            className="text-xs text-primary hover:underline"
          >
            View All
          </button>
        </div>
        
        {groupsQuery.isLoading ? (
          <div className="flex justify-center py-2">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        ) : groupsQuery.data && groupsQuery.data.length > 0 ? (
          <ul className="space-y-1">
            {groupsQuery.data
              .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
              .slice(0, 5)
              .map((group) => (
                <li key={group.id}>
                  <button
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="flex items-center px-3 py-2 w-full text-left rounded-lg hover:bg-base-300 text-base-content"
                  >
                    <div className="avatar mr-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <span className="truncate">{group.name}</span>
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-base-content/60 py-2">No groups available</p>
        )}
        
        <button
          onClick={() => navigate("/groups/create")}
          className="flex items-center px-3 py-2 mt-2 w-full text-left rounded-lg hover:bg-base-300 text-primary"
        >
          <MdGroup className="mr-2" />
          Create New Group
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="font-medium text-base-content/60 text-sm mb-2 px-2">Categories</h3>
        <div className="px-2">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className="badge badge-outline hover:badge-primary cursor-pointer"
                onClick={() => {
                  navigate(`/home?category=${category}`);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="mb-6">
        <h3 className="font-medium text-base-content/60 text-sm mb-2 px-2">Resources</h3>
        <ul className="space-y-1">
          {resources.map((resource) => (
            <li key={resource.name}>
              <NavLink
                to={resource.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                    isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                  }`
                }
              >
                <span className="mr-2">{resource.icon}</span>
                {resource.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Add a divider before admin section if user is admin */}
      {isAdmin && (
        <>
          <div className="divider my-2"></div>
          <div className="mb-6">
            <h3 className="font-medium text-base-content/60 text-sm mb-2 px-2">Admin</h3>
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                      isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                    }`
                  }
                >
                  <CiUser className="mr-2" />
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/posts"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                      isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                    }`
                  }
                >
                  <HiOutlineTrendingUp className="mr-2" />
                  Posts
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/groups"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                      isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                    }`
                  }
                >
                  <MdGroup className="mr-2" />
                  Groups
                </NavLink>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Menu;
