import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../api/interfaces";
import {
  MdGroup,
  MdInventory2,
  MdAssessment,
  MdSwapHorizontalCircle,
  MdPeople,
  MdForum,
  MdNotifications,
  MdEvent,
  MdMessage,
  MdThumbUp,
  MdComment,
  MdAdminPanelSettings,
} from "react-icons/md";
import {
  fetchAllUsers,
  fetchAllPosts,
  fetchAllComments,
  fetchAllReactions,
  fetchAllNotifications,
  fetchAllEvents,
  fetchAllGroups,
} from "../api/ApiCollection";
import TopDealsBox from "../components/topDealsBox/TopDealsBox";
import ChartBox from "../components/charts/ChartBox";

const AdminHome = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
      console.log("AdminHome - Decoded Token:", decoded);
      console.log("AdminHome - User role:", decoded.role);

      // Accept both role formats
      const isAdmin = decoded.role === "ROLE_ADMIN" || decoded.role === "ADMIN";
      if (!isAdmin) {
        console.log("AdminHome - Non-admin user detected, redirecting to error page");
        navigate("/error");
      } else {
        console.log("AdminHome - Admin access confirmed");
      }
    } catch (err) {
      console.error("Failed to decode token:", err);
      navigate("/error");
    }
  }, [navigate]);

  // Set up query options with retry
  const queryOptions = {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      console.error("Query error:", error);
    },
    meta: {
      // This prevents React Query from sending internal objects as query params
      skipSerializingUrl: true
    }
  };

  // 2) Now your existing queries
  const queryGetTotalUsers = useQuery({
    queryKey: ["totalusers"],
    queryFn: async () => {
      try {
        console.log("Fetching users...");
        const data = await fetchAllUsers();
        console.log("Users data received:", data);
        return data;
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },
    ...queryOptions
  });

  // Log query statuses to debug the empty admin page
  React.useEffect(() => {
    console.log("AdminHome - Users query:", {
      data: queryGetTotalUsers.data,
      isLoading: queryGetTotalUsers.isLoading,
      isError: queryGetTotalUsers.isError,
      error: queryGetTotalUsers.error
    });
    
    if (queryGetTotalUsers.isError) {
      console.error("AdminHome - Error fetching users:", queryGetTotalUsers.error);
    }
  }, [queryGetTotalUsers.data, queryGetTotalUsers.isLoading, queryGetTotalUsers.isError, queryGetTotalUsers.error]);

  const queryGetTotalProducts = useQuery({
    queryKey: ["totalposts"],
    queryFn: async () => {
      try {
        return await fetchAllPosts();
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
    },
    ...queryOptions
  });

  const queryGetTotalRatio = useQuery({
    queryKey: ["totalcomments"],
    queryFn: async () => {
      try {
        return await fetchAllComments();
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
    },
    ...queryOptions
  });

  const queryGetTotalRevenue = useQuery({
    queryKey: ["totalreactions"],
    queryFn: async () => {
      try {
        return await fetchAllReactions();
      } catch (error) {
        console.error("Error fetching reactions:", error);
        throw error;
      }
    },
    ...queryOptions
  });

  const queryGetTotalSource = useQuery({
    queryKey: ["totalnotifications"],
    queryFn: async () => {
      try {
        return await fetchAllNotifications();
      } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
    },
    ...queryOptions
  });

  const queryGetTotalRevenueByProducts = useQuery({
    queryKey: ["totalevents"],
    queryFn: async () => {
      try {
        return await fetchAllEvents();
      } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
    },
    ...queryOptions
  });

  const queryGetTotalVisit = useQuery({
    queryKey: ["totalgroups"],
    queryFn: async () => {
      try {
        return await fetchAllGroups();
      } catch (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }
    },
    ...queryOptions
  });

  // Quick access cards based on backend controllers
  const adminFeatures = [
    { title: "Users", icon: <MdPeople className="text-3xl" />, route: "/admin/users", color: "bg-primary" },
    { title: "Posts", icon: <MdInventory2 className="text-3xl" />, route: "/admin/posts", color: "bg-secondary" },
    { title: "Comments", icon: <MdComment className="text-3xl" />, route: "/admin/comments", color: "bg-accent" },
    { title: "Groups", icon: <MdGroup className="text-3xl" />, route: "/admin/groups", color: "bg-info" },
    { title: "Reactions", icon: <MdThumbUp className="text-3xl" />, route: "/admin/reactions", color: "bg-success" },
    { title: "Notifications", icon: <MdNotifications className="text-3xl" />, route: "/admin/notifications", color: "bg-warning" },
    { title: "Events", icon: <MdEvent className="text-3xl" />, route: "/admin/events", color: "bg-error" },
    { title: "Messages", icon: <MdMessage className="text-3xl" />, route: "/admin/messages", color: "bg-neutral" },
    { title: "Group Requests", icon: <MdAdminPanelSettings className="text-3xl" />, route: "/admin/group-requests", color: "bg-primary-focus" },
  ];

  return (
    <div className="home w-full p-0 m-0">
      <h1 className="text-2xl font-bold my-4">Admin Dashboard</h1>
      
      {/* Quick Access Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {adminFeatures.map((feature, index) => (
            <div 
              key={index}
              className={`${feature.color} text-white rounded-lg shadow-md p-4 cursor-pointer hover:opacity-90 transition-opacity flex flex-col items-center justify-center gap-2`}
              onClick={() => navigate(feature.route)}
            >
              {feature.icon}
              <span className="font-medium">{feature.title}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fallback content that will show even if queries fail */}
      <div className="bg-primary text-primary-content p-4 rounded-lg mb-4">
        <h2 className="text-xl">Welcome to the Admin Dashboard</h2>
        <p>You are logged in as an administrator.</p>
      </div>
      
      {/* Original dashboard content */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 grid-flow-dense auto-rows-[minmax(200px,auto)] xl:auto-rows-[minmax(150px,auto)] gap-3 xl:gap-3 px-0">
        {/* Show loading/error states */}
        {queryGetTotalUsers.isLoading && (
          <div className="col-span-full flex justify-center p-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        )}
        
        {queryGetTotalUsers.isError && (
          <div className="col-span-full bg-error text-error-content p-4 rounded-lg">
            <p>Error loading dashboard data. Please try again later.</p>
            <pre className="text-xs mt-2 overflow-auto max-h-20">
              {JSON.stringify(queryGetTotalUsers.error, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Only show dashboard if data is successfully loaded */}
        {queryGetTotalUsers.isSuccess && (
          <>
            <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3 3xl:row-span-5">
              <TopDealsBox />
            </div>
            <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
              <ChartBox
                chartType="line"
                IconBox={MdGroup}
                title="Total Users"
                data={queryGetTotalUsers.data}
                isLoading={queryGetTotalUsers.isLoading}
                isSuccess={queryGetTotalUsers.isSuccess}
              />
            </div>
            <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
              <ChartBox
                chartType="line"
                IconBox={MdInventory2}
                title="Total Products"
                data={queryGetTotalProducts.data}
                isLoading={queryGetTotalProducts.isLoading}
                isSuccess={queryGetTotalProducts.isSuccess}
              />
            </div>
            <div className="box row-span-3 col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-5">
              <ChartBox
                chartType="pie"
                title="Leads by Source"
                data={queryGetTotalSource.data}
                isLoading={queryGetTotalSource.isLoading}
                isSuccess={queryGetTotalSource.isSuccess}
              />
            </div>
            <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
              <ChartBox
                chartType="line"
                IconBox={MdAssessment}
                title="Total Ratio"
                data={queryGetTotalRatio.data}
                isLoading={queryGetTotalRatio.isLoading}
                isSuccess={queryGetTotalRatio.isSuccess}
              />
            </div>
            <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
              <ChartBox
                chartType="line"
                IconBox={MdSwapHorizontalCircle}
                title="Total Revenue"
                data={queryGetTotalRevenue.data}
                isLoading={queryGetTotalRevenue.isLoading}
                isSuccess={queryGetTotalRevenue.isSuccess}
              />
            </div>
            <div className="box row-span-2 col-span-full xl:col-span-2 3xl:row-span-3">
              <ChartBox
                chartType="area"
                title="Revenue by Products"
                data={queryGetTotalRevenueByProducts.data}
                isLoading={queryGetTotalRevenueByProducts.isLoading}
                isSuccess={queryGetTotalRevenueByProducts.isSuccess}
              />
            </div>
            <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
              <ChartBox
                chartType="bar"
                title="Total Visit"
                data={queryGetTotalVisit.data}
                isLoading={queryGetTotalVisit.isLoading}
                isSuccess={queryGetTotalVisit.isSuccess}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
