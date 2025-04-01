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
import { Visibility, CommentResponseDto, PostResponseDto } from "../../api/interfaces";
import AddData from "../../components/AddData";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface CommentsProps {
  showActiveOnly?: boolean;
}

const Comments: React.FC<CommentsProps> = ({ showActiveOnly: initialActiveOnly = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(initialActiveOnly);
  const [selectedPost, setSelectedPost] = useState<PostResponseDto | null>(null);
  const [selectedParentComment, setSelectedParentComment] = useState<CommentResponseDto | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
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
      const response = showActiveOnly 
        ? await API.fetchActiveComments()
        : await API.fetchAllComments();
      const transformedData = response.map((comment: CommentResponseDto) => ({
        ...comment,
        isDeleted: comment.isDeleted || false,
        postId: comment.postId || null,
        parentCommentId: comment.parentCommentId || null,
        reactionCount: comment.reactionCount || 0,
        reactionTypes: comment.reactionTypes || {},
        replies: comment.replies || []
      }));
      return transformedData;
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
    navigate(`/admin/comments/${commentId}/edit`, {
      state: { from: '/admin/comments' }
    });
  };

  const handleViewPost = async (postId: number) => {
    try {
      const post = await API.fetchPostById(postId);
      setSelectedPost(post);
      setIsPostModalOpen(true);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to fetch post details");
    }
  };

  const handleViewParentComment = async (commentId: number) => {
    try {
      const comment = await API.fetchCommentById(commentId);
      setSelectedParentComment(comment);
      setIsParentModalOpen(true);
    } catch (error) {
      console.error("Error fetching parent comment:", error);
      toast.error("Failed to fetch parent comment details");
    }
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
      renderCell: (params) => {
        const visibility = params.row.visibility;
        if (!visibility) return null;
        return visibility === Visibility.PUBLIC ? (
          <div className="flex gap-1 items-center">
            <HiOutlineGlobeAmericas className="text-lg" />
            <span>Public</span>
          </div>
        ) : (
          <div className="flex gap-1 items-center">
            <HiOutlineLockClosed className="text-lg" />
            <span>Private</span>
          </div>
        );
      },
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
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <span>{params.row.postId || 'N/A'}</span>
          {params.row.postId && (
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => handleViewPost(params.row.postId)}
            >
              View Post
            </button>
          )}
        </div>
      ),
    },
    {
      field: "parentCommentId",
      headerName: "Parent Comment",
      minWidth: 120,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <span>{params.row.parentCommentId || 'N/A'}</span>
          {params.row.parentCommentId && (
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => handleViewParentComment(params.row.parentCommentId)}
            >
              View Parent
            </button>
          )}
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
                onClick={() => {
                  setShowActiveOnly(!showActiveOnly);
                  queryClient.invalidateQueries({ queryKey: ["comments"] });
                }}
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

      {/* Post Details Modal */}
      {isPostModalOpen && selectedPost && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Post Details</h3>
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Title:</span> {selectedPost.title}
              </div>
              <div>
                <span className="font-semibold">Content:</span>
                <p className="mt-1 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
              <div>
                <span className="font-semibold">Author:</span> {selectedPost.username}
              </div>
              <div>
                <span className="font-semibold">Created:</span> {format(new Date(selectedPost.createdAt), 'PPpp')}
              </div>
              <div>
                <span className="font-semibold">Category:</span> {selectedPost.category}
              </div>
              <div>
                <span className="font-semibold">Visibility:</span>
                <div className="flex gap-1 items-center mt-1">
                  {selectedPost.visibility === Visibility.PUBLIC ? (
                    <>
                      <HiOutlineGlobeAmericas className="text-lg" />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineLockClosed className="text-lg" />
                      <span>Private</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <span className="font-semibold">Reactions:</span> {selectedPost.reactionCount}
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsPostModalOpen(false)}>Close</button>
              <button 
                className="btn btn-primary" 
                onClick={() => window.open(`/posts/${selectedPost.id}`, '_blank')}
              >
                Open in New Tab
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsPostModalOpen(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Parent Comment Details Modal */}
      {isParentModalOpen && selectedParentComment && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Parent Comment Details</h3>
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Content:</span>
                <p className="mt-1 whitespace-pre-wrap">{selectedParentComment.content}</p>
              </div>
              <div>
                <span className="font-semibold">Author:</span> {selectedParentComment.username}
              </div>
              <div>
                <span className="font-semibold">Created:</span> {format(new Date(selectedParentComment.createdAt), 'PPpp')}
              </div>
              <div>
                <span className="font-semibold">Reactions:</span> {selectedParentComment.reactionCount}
              </div>
              {selectedParentComment.mediaUrl && (
                <div>
                  <span className="font-semibold">Media:</span>
                  <a 
                    href={selectedParentComment.mediaUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:underline"
                  >
                    View Media
                  </a>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsParentModalOpen(false)}>Close</button>
              <button 
                className="btn btn-primary" 
                onClick={() => window.open(`/comments/${selectedParentComment.id}`, '_blank')}
              >
                Open in New Tab
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsParentModalOpen(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Create Comment Modal */}
      {isModalOpen && (
        <AddData
          slug="comment"
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
            queryClient.invalidateQueries({ queryKey: ["allposts"] });
          }}
        />
      )}
    </div>
  );
};

export default Comments;
