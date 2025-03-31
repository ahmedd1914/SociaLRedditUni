import React, { useState, useEffect } from "react";
import { GridColDef } from "@mui/x-data-grid";
import DataTable from "../../components/DataTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../../api/api";
import {
  HiOutlineGlobeAmericas,
  HiOutlineLockClosed,
  HiPlus,
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";
import { Visibility, CommentResponseDto } from "../../api/interfaces";
import AddData from "../../components/AddData";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface CommentsProps {
  showActiveOnly?: boolean;
}

const Comments: React.FC<CommentsProps> = ({ showActiveOnly: initialActiveOnly = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(initialActiveOnly);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error("You need admin privileges to access this page");
      navigate('/');
    }
  }, [user, navigate]);

  const { isLoading, isSuccess, data, error } = useQuery({
    queryKey: ["comments", showActiveOnly],
    queryFn: async () => {
      const response = await API.fetchAllComments();
      const transformedData = response.map((comment: CommentResponseDto) => ({
        ...comment,
        isDeleted: comment.isDeleted
      }));
      return showActiveOnly ? transformedData.filter(comment => !comment.isDeleted) : transformedData;
    },
    enabled: !!user && user.role === 'ADMIN',
    retry: false,
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch comments");
      console.error("Error fetching comments:", error);
    }
  }, [error]);

  // Function to handle comment deletion
  const handleDelete = async (commentId: number) => {
    try {
      await API.deleteComment(commentId);
      toast.success("Comment deleted successfully!");
      // Invalidate both comments and posts queries to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["allposts"] });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  // Function to handle comment edit
  const handleEdit = async (commentId: number) => {
    navigate(`/admin/comments/${commentId}/edit`);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", minWidth: 90 },
    {
      field: "content",
      headerName: "Content",
      minWidth: 500,
      flex: 1,
      renderCell: (params) => (
        <div className="flex flex-col items-start gap-0">
          <p className="text-[14px] line-clamp-2">{params.row.content}</p>
          {params.row.mediaUrl && (
            <a
              href={params.row.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              View Media
            </a>
          )}
        </div>
      ),
    },
    {
      field: "username",
      headerName: "Author",
      minWidth: 220,
      flex: 1,
    },
    {
      field: "visibility",
      headerName: "Visibility",
      minWidth: 120,
      flex: 1,
      renderCell: (params) =>
        params.row.visibility === Visibility.PUBLIC ? (
          <div className="flex gap-1 items-center">
            <HiOutlineGlobeAmericas className="text-lg" />
            <span>{params.row.visibility}</span>
          </div>
        ) : (
          <div className="flex gap-1 items-center">
            <HiOutlineLockClosed className="text-lg" />
            <span>{params.row.visibility}</span>
          </div>
        ),
    },
    {
      field: "isDeleted",
      headerName: "Status",
      minWidth: 120,
      flex: 1,
      renderCell: (params) => {
        // Check for both 'isDeleted' and 'deleted' fields
        const isDeleted = params.row.isDeleted || params.row.deleted;
        
        return (
          <div className={`px-2 py-1 rounded-full text-sm ${
            isDeleted
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          }`}>
            {isDeleted ? "NOT ACTIVE" : "Active"}
          </div>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      minWidth: 120,
    },
    {
      field: "reactionCount",
      headerName: "Likes",
      minWidth: 80,
      type: "number",
    },
    {
      field: "postId",
      headerName: "Post ID",
      minWidth: 100,
      type: "number",
    },
    {
      field: "parentCommentId",
      headerName: "Parent Comment",
      minWidth: 120,
      renderCell: (params) => (
        <div>
          {params.row.parentCommentId ? params.row.parentCommentId : "N/A"}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full p-0 m-0">
      <div className="w-full flex flex-col items-stretch gap-3">
        <div className="w-full flex justify-between mb-5">
          <div className="flex flex-col">
            <h2 className="font-bold text-2xl xl:text-4xl text-base-content dark:text-neutral-200">
              Comments
            </h2>
            {data && data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {data.length} Comments Found
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className={`btn ${
                  showActiveOnly ? "btn-primary" : "btn-ghost"
                } flex items-center gap-2`}
                title={showActiveOnly ? "Showing active comments" : "Showing all comments"}
              >
                <HiOutlineAdjustmentsHorizontal className="text-lg" />
                {showActiveOnly ? "Active Only" : "All Comments"}
              </button>
            </div>

            {/* Create Comment Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <HiPlus className="text-lg" />
              Create Comment
            </button>
          </div>
        </div>

        {isLoading ? (
          <DataTable
            slug="comments"
            columns={columns}
            rows={[]}
            includeActionColumn={false}
          />
        ) : isSuccess ? (
          <DataTable
            slug="comments"
            columns={columns}
            rows={data}
            includeActionColumn={true}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ) : (
          <>
            <DataTable
              slug="comments"
              columns={columns}
              rows={[]}
              includeActionColumn={false}
            />
            <div className="w-full flex justify-center">
              Error while fetching comments!
            </div>
          </>
        )}
      </div>

      {/* Create Comment Modal */}
      {isModalOpen && (
        <AddData
          slug="comment"
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onSuccess={() => {
            // Invalidate both comments and posts queries to ensure UI is updated
            queryClient.invalidateQueries({ queryKey: ["comments"] });
            queryClient.invalidateQueries({ queryKey: ["allposts"] });
          }}
        />
      )}
    </div>
  );
};

export default Comments;
