import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  MdGroup, 
  MdInventory2, 
  MdPerson, 
  MdComment, 
  MdEvent, 
  MdNotifications,
  MdMessage,
  MdThumbUp,
  MdAdminPanelSettings
} from 'react-icons/md';
import { HiOutlineHome, HiOutlineTrendingUp } from 'react-icons/hi';
import { FiSettings } from 'react-icons/fi';

const AdminMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  
  return (
    <div className="w-full h-full overflow-auto px-1 py-2">
      <div className="flex flex-col gap-3 mb-5">
        <Link to="/admin/home" className="btn btn-primary w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
      </div>

      {/* Main Navigation for Admins */}
      <div className="border-b border-base-300 dark:border-slate-700 pb-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Main</h3>
        <ul className="menu menu-sm p-0 w-full">
          <li>
            <Link to="/home" className="active:bg-primary active:text-primary-content py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
          </li>
          <li>
            <Link to="/posts" className="active:bg-primary active:text-primary-content py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Posts
            </Link>
          </li>
          <li>
            <Link to="/groups" className="active:bg-primary active:text-primary-content py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Groups
            </Link>
          </li>
          <li>
            <Link to="/events" className="active:bg-primary active:text-primary-content py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Events
            </Link>
          </li>
          <li>
            <Link to="/notifications" className="active:bg-primary active:text-primary-content py-2">
              <div className="indicator w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="indicator-item badge badge-xs badge-primary"></span>
              </div>
              Notifications
            </Link>
          </li>
        </ul>
      </div>

      {/* Admin Menu Sections */}
      <div className="mb-4">
        {/* Admin Dashboard Section */}
        <div className="mb-6">
          <h3 className="font-medium text-base-content/60 text-sm mb-2 px-2">Dashboard</h3>
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/admin/home"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                    isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                  }`
                }
              >
                <HiOutlineHome className="mr-2" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                    isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                  }`
                }
              >
                <MdPerson className="mr-2" />
                Users Management
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Content Management */}
        <div className="mb-6">
          <h3 className="font-medium text-base-content/60 text-sm mb-2 px-2">Content Management</h3>
          <ul className="space-y-1">
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
                to="/admin/comments"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                    isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                  }`
                }
              >
                <MdComment className="mr-2" />
                Comments
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/reactions"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                    isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                  }`
                }
              >
                <MdThumbUp className="mr-2" />
                Reactions
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
            <li>
              <NavLink
                to="/admin/group-requests"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                    isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                  }`
                }
              >
                <MdAdminPanelSettings className="mr-2" />
                Group Requests
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/events"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                    isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                  }`
                }
              >
                <MdEvent className="mr-2" />
                Events
              </NavLink>
            </li>
          </ul>
        </div>

        {/* System Section */}
        <div className="mb-6">
          <h3 className="font-medium text-base-content/60 text-sm mb-2 px-2">System</h3>
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/admin/notifications"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                    isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                  }`
                }
              >
                <MdNotifications className="mr-2" />
                Notifications
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/messages"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                    isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                  }`
                }
              >
                <MdMessage className="mr-2" />
                Messages
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg hover:bg-base-300 ${
                    isActive ? "bg-base-300 text-primary font-medium" : "text-base-content"
                  }`
                }
              >
                <FiSettings className="mr-2" />
                Settings
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Link back to user area */}
        <div className="divider my-2"></div>
        <div className="mb-6">
          <h3 className="font-medium text-base-content/60 text-sm mb-2 px-2">User Area</h3>
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/home"
                className="flex items-center px-3 py-2 rounded-lg hover:bg-base-300 text-base-content"
              >
                <HiOutlineHome className="mr-2" />
                User Home
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminMenu; 