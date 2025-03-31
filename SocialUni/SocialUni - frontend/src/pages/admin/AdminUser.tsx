import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../../api/api";
import { UserActivity } from "../../api/interfaces";
import { useAuth } from "../../contexts/AuthContext";
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeft,
  HiOutlineUserGroup,
} from "react-icons/hi2";

const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error("You need admin privileges to access this page");
      navigate('/');
    }
  }, [user, navigate]);

  const { isLoading, isError, data, isSuccess } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!user || user.role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin privileges required");
      }
      const userData = await API.fetchUserById(Number(id));
      return userData;
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  // Reset image error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [id]);

  // Add new query for activities
  const { data: activities } = useQuery<UserActivity[]>({
    queryKey: ["userActivities", id],
    queryFn: async (): Promise<UserActivity[]> => {
      if (!user || user.role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin privileges required");
      }
      return await API.fetchUserActivities(Number(id));
    },
    enabled: !!data && !!user && user.role === 'ADMIN', // Only fetch activities after user data is loaded and user is admin
  });

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return;

    try {
      await API.deleteUser(Number(id));
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["allusers"] });
      navigate("/admin/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    if (isLoading) {
      toast.loading("Loading user...", { id: "userToast" });
    }
    if (isError) {
      toast.error("Error loading user data!", { id: "userToast" });
    }
    if (isSuccess) {
      toast.success("User data loaded!", { id: "userToast" });
    }
  }, [isLoading, isError, isSuccess]);

  if (isLoading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (isError) {
    return <div className="text-error">Error loading user data!</div>;
  }

  if (!data) {
    return <div className="text-warning">No user found!</div>;
  }

  // Activity icon mapper
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "POST":
        return <HiOutlineDocumentText className="text-xl" />;
      case "COMMENT":
        return <HiOutlineChatBubbleLeft className="text-xl" />;
      case "GROUP":
        return <HiOutlineUserGroup className="text-xl" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-0 m-0">
      {/* Header with Actions */}
      <div className="w-full flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">User Details</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/users/${id}/edit`)}
            className="btn btn-ghost"
            title="Edit user"
          >
            <HiOutlinePencilSquare className="text-xl" />
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-ghost text-error"
            title="Delete user"
          >
            <HiOutlineTrash className="text-xl" />
          </button>
        </div>
      </div>

      <div className="w-full grid xl:grid-cols-2 gap-10">
        {/* User Profile Card */}
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-6">
              <div className="avatar">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  {data.imgUrl && !imageError ? (
                    <img
                      src={data.imgUrl}
                      alt={data.username}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="bg-neutral-content w-full h-full flex items-center justify-center">
                      <HiOutlineUser className="text-4xl" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{data.username}</h3>
                <p className="text-base-content/60">
                  {data.fname} {data.lname}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm opacity-70">Email</label>
                  <p>{data.email}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Phone</label>
                  <p>{data.phoneNumber || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Role</label>
                  <p>{data.role || "USER"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm opacity-70">Status</label>
                  <p>{data.enabled ? "Active" : "Inactive"}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Created At</label>
                  <p>{new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Last Login</label>
                  <p>
                    {data.lastLogin
                      ? new Date(data.lastLogin).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Activity Card */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activities?.slice(0, 5).map((activity: UserActivity) => (
                <div
                  key={activity.id}
                  className="bg-base-100 p-4 rounded-lg cursor-pointer hover:bg-base-300 transition-colors flex items-center gap-3"
                  onClick={() => {
                    switch (activity.type) {
                      case "POST":
                        navigate(`/admin/posts/${activity.entityId}`);
                        break;
                      case "COMMENT":
                        navigate(`/admin/comments/${activity.entityId}`);
                        break;
                      case "GROUP":
                        navigate(`/admin/groups/${activity.entityId}`);
                        break;
                    }
                  }}
                >
                  <div className="text-primary">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">
                        {activity.type}
                      </span>
                      <span className="text-sm opacity-70">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium">{activity.title}</p>
                    {activity.content && (
                      <p className="text-sm opacity-70 line-clamp-2">
                        {activity.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {(!activities || activities.length === 0) && (
                <p className="text-base-content/60">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
