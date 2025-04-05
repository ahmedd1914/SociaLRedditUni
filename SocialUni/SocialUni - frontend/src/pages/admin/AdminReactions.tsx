import React, { useState, useEffect } from 'react';
import { MdThumbUp, MdDelete, MdVisibility, MdThumbDown, MdOutlineBarChart, MdAdd, MdEdit, MdClose } from 'react-icons/md';
import { FaHeart, FaLaugh, FaSadTear, FaAngry, FaSurprise } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../../api/api';
import { ReactionResponseDto, ReactionStatsDto, PostResponseDto, CommentResponseDto } from '../../api/interfaces';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminReactions = () => {
  const [selectedReaction, setSelectedReaction] = useState<ReactionResponseDto | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [newReaction, setNewReaction] = useState({
    postId: '',
    commentId: '',
    type: 'LIKE'
  });
  const [editingReaction, setEditingReaction] = useState<ReactionResponseDto | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostResponseDto | null>(null);
  const [selectedComment, setSelectedComment] = useState<CommentResponseDto | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch all reactions from backend
  const { 
    data: reactions = [], 
    isLoading, 
    isError 
  } = useQuery<ReactionResponseDto[]>({
    queryKey: ['adminReactions'],
    queryFn: async () => {
      const response = await API.fetchAllReactions();
      return Array.isArray(response) ? response : [];
    }
  });

  // Fetch reaction statistics
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError
  } = useQuery<ReactionStatsDto>({
    queryKey: ['reactionStats'],
    queryFn: async () => {
      const reactions = await API.fetchAllReactions();
      // Calculate stats from reactions
      const totalReactions = reactions.length;
      const reactionCounts = reactions.reduce((acc, reaction) => {
        acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const mostCommonReaction = Object.entries(reactionCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'LIKE';
      
      // Calculate recent reactions (last 24 hours)
      const recentReactionsCount = reactions.filter(reaction => {
        const reactionDate = new Date(reaction.timestamp);
        const now = new Date();
        return now.getTime() - reactionDate.getTime() <= 24 * 60 * 60 * 1000;
      }).length;

      return {
        totalReactions,
        mostCommonReaction,
        recentReactionsCount,
        reactionsByType: reactionCounts
      };
    },
    enabled: showStats
  });

  // Delete reaction mutation
  const deleteReactionMutation = useMutation({
    mutationFn: (reactionId: number) => API.removeReaction(reactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReactions'] });
      queryClient.invalidateQueries({ queryKey: ['reactionStats'] });
      toast.success('Reaction deleted successfully');
      setSelectedReaction(null);
      setShowEditForm(false);
    },
    onError: (error) => {
      console.error('Error deleting reaction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete reaction');
    }
  });

  // Add reaction mutation
  const addReactionMutation = useMutation<string, Error, { postId?: number; commentId?: number; type: string }>({
    mutationFn: (reactionData) => 
      API.addReaction(
        reactionData.postId || 0, 
        reactionData.type as any,
        reactionData.commentId
      ),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['adminReactions'] });
      queryClient.invalidateQueries({ queryKey: ['reactionStats'] });
      toast.success(typeof message === 'string' ? message : 'Reaction added successfully');
      setShowAddForm(false);
      setNewReaction({ postId: '', commentId: '', type: 'LIKE' });
    },
    onError: (error) => {
      console.error('Error adding reaction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add reaction');
    }
  });

  // Edit reaction mutation
  const editReactionMutation = useMutation({
    mutationFn: (reactionData: { id: number; type: string }) => 
      API.removeReaction(reactionData.id).then(() => 
        API.addReaction(
          editingReaction?.postId || 0, 
          reactionData.type as any,
          editingReaction?.commentId
        )
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReactions'] });
      queryClient.invalidateQueries({ queryKey: ['reactionStats'] });
      toast.success('Reaction updated successfully');
      setShowEditForm(false);
      setEditingReaction(null);
    },
    onError: (error) => {
      console.error('Error updating reaction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update reaction');
    }
  });

  const handleViewReaction = (reaction: ReactionResponseDto) => {
    setSelectedReaction(reaction);
  };

  const handleEditReaction = (reaction: ReactionResponseDto) => {
    setEditingReaction(reaction);
    setShowEditForm(true);
  };

  const handleDeleteReaction = (id: number) => {
    if (window.confirm('Are you sure you want to delete this reaction?')) {
      deleteReactionMutation.mutate(id);
    }
  };

  const handleAddReaction = (e: React.FormEvent) => {
    e.preventDefault();
    const reactionData = {
      postId: newReaction.postId ? parseInt(newReaction.postId) : undefined,
      commentId: newReaction.commentId ? parseInt(newReaction.commentId) : undefined,
      type: newReaction.type
    };
    addReactionMutation.mutate(reactionData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReaction) {
      editReactionMutation.mutate({
        id: editingReaction.id,
        type: editingReaction.type
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <MdThumbUp className="text-primary" />;
      case 'LOVE':
        return <FaHeart className="text-red-500" />;
      case 'HAHA':
        return <FaLaugh className="text-yellow-500" />;
      case 'SAD':
        return <FaSadTear className="text-blue-500" />;
      case 'ANGRY':
        return <FaAngry className="text-orange-500" />;
      case 'WOW':
        return <FaSurprise className="text-purple-500" />;
      default:
        return <MdThumbUp className="text-secondary" />;
    }
  };

  const getReactionBadgeColor = (type: string) => {
    return 'badge-ghost';  // Use ghost style for transparent background
  };

  const toggleStats = () => {
    setShowStats(!showStats);
  };

  const handleViewPost = async (postId: number) => {
    setSelectedPostId(postId);
    setShowPostModal(true);
    setIsLoadingPost(true);
    try {
      const postDetails = await API.fetchPostDetails(postId);
      setSelectedPost(postDetails);
    } catch (error) {
      console.error('Error fetching post details:', error);
      toast.error('Failed to load post details');
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handleViewComment = async (commentId: number) => {
    setSelectedCommentId(commentId);
    setShowCommentModal(true);
    setIsLoadingComment(true);
    try {
      const commentDetails = await API.fetchCommentDetails(commentId);
      setSelectedComment(commentDetails);
    } catch (error) {
      console.error('Error fetching comment details:', error);
      toast.error('Failed to load comment details');
    } finally {
      setIsLoadingComment(false);
    }
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user) {
      toast.error("Authentication required");
      navigate('/login');
      return;
    }

    const role = String(user.role || '').trim().toUpperCase();
    const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
    
    if (!isAdmin) {
      toast.error("You need admin privileges to access this page");
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MdThumbUp className="text-2xl mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Admin Reactions</h1>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <MdAdd className="mr-1" />
            Add Reaction
          </button>
          <button
            className={`btn btn-sm ${showStats ? 'btn-primary' : 'btn-outline'}`}
            onClick={toggleStats}
          >
            <MdOutlineBarChart className="mr-1" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
      </div>

      {/* Add Reaction Form */}
      {showAddForm && (
        <div className="bg-base-100 rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Add New Reaction</h2>
          <form onSubmit={handleAddReaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Post ID (Optional)</span>
                  <span className="label-text-alt text-info">Fill either Post ID or Comment ID</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={newReaction.postId}
                  onChange={(e) => {
                    setNewReaction({ 
                      ...newReaction, 
                      postId: e.target.value,
                      commentId: e.target.value ? '' : newReaction.commentId // Clear commentId if postId is filled
                    });
                  }}
                  placeholder="Enter post ID"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Comment ID (Optional)</span>
                  <span className="label-text-alt text-info">Fill either Post ID or Comment ID</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={newReaction.commentId}
                  onChange={(e) => {
                    setNewReaction({ 
                      ...newReaction, 
                      commentId: e.target.value,
                      postId: e.target.value ? '' : newReaction.postId // Clear postId if commentId is filled
                    });
                  }}
                  placeholder="Enter comment ID"
                />
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text">Reaction Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newReaction.type}
                onChange={(e) => setNewReaction({ ...newReaction, type: e.target.value })}
              >
                <option value="LIKE">Like</option>
                <option value="LOVE">Love</option>
                <option value="HAHA">Haha</option>
                <option value="WOW">Wow</option>
                <option value="SAD">Sad</option>
                <option value="ANGRY">Angry</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addReactionMutation.isPending}
              >
                {addReactionMutation.isPending ? 'Adding...' : 'Add Reaction'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Reaction Form */}
      {showEditForm && editingReaction && (
        <div className="bg-base-100 rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Edit Reaction</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Reaction Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editingReaction.type}
                onChange={(e) => setEditingReaction({ ...editingReaction, type: e.target.value })}
              >
                <option value="LIKE">Like</option>
                <option value="LOVE">Love</option>
                <option value="HAHA">Haha</option>
                <option value="WOW">Wow</option>
                <option value="SAD">Sad</option>
                <option value="ANGRY">Angry</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingReaction(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={editReactionMutation.isPending}
              >
                {editReactionMutation.isPending ? 'Updating...' : 'Update Reaction'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats panel */}
      {showStats && (
        <div className="bg-base-100 rounded-lg shadow p-4 mb-6">
          {statsLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="loading loading-spinner loading-md"></div>
            </div>
          ) : statsError ? (
            <div className="text-error">Failed to load statistics</div>
          ) : stats ? (
            <div>
              <h2 className="text-lg font-semibold mb-3">Reaction Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title">Total Reactions</div>
                  <div className="stat-value text-2xl">{stats.totalReactions}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title">Most Used Reaction</div>
                  <div className="stat-value text-2xl">
                    <span className={`badge ${getReactionBadgeColor(stats.mostCommonReaction)}`}>
                      {getReactionIcon(stats.mostCommonReaction)} {stats.mostCommonReaction}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">No statistics available</div>
          )}
        </div>
      )}

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : isError ? (
          <div className="alert alert-error m-4">
            <p>Error loading reactions. Please try again later.</p>
          </div>
        ) : !Array.isArray(reactions) || reactions.length === 0 ? (
          <div className="text-center p-6">
            <p>No reactions found.</p>
          </div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Target</th>
                <th>Type</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reactions.map((reaction) => (
                <tr key={reaction.id} className="hover">
                  <td>{reaction.id}</td>
                  <td>
                    <div className="font-medium">{reaction.username}</div>
                    <div className="text-sm opacity-50">ID: {reaction.userId}</div>
                  </td>
                  <td>
                    {reaction.postTitle ? (
                      <div>
                        <div className="font-medium">Post: {reaction.postTitle}</div>
                        <div className="text-sm opacity-50">ID: {reaction.postId}</div>
                        <button 
                          className="btn btn-xs btn-ghost mt-1"
                          onClick={() => reaction.postId && handleViewPost(reaction.postId)}
                        >
                          View Post
                        </button>
                      </div>
                    ) : reaction.commentId ? (
                      <div>
                        <div className="font-medium">Comment: {reaction.commentContent}</div>
                        <div className="text-sm opacity-50">ID: {reaction.commentId}</div>
                        <div className="text-sm opacity-50">By: {reaction.commentAuthorUsername}</div>
                        <button 
                          className="btn btn-xs btn-ghost mt-1"
                          onClick={() => reaction.commentId && handleViewComment(reaction.commentId)}
                        >
                          View Comment
                        </button>
                      </div>
                    ) : (
                      <span className="text-error">No target found</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${getReactionBadgeColor(reaction.type)}`}>
                      {getReactionIcon(reaction.type)} {reaction.type}
                    </span>
                  </td>
                  <td>{formatDate(reaction.timestamp)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewReaction(reaction)}
                        className="btn btn-sm btn-circle btn-ghost"
                        title="View Details"
                      >
                        <MdVisibility />
                      </button>
                      <button
                        onClick={() => handleEditReaction(reaction)}
                        className="btn btn-sm btn-circle btn-warning"
                        title="Edit Reaction"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteReaction(reaction.id)}
                        className="btn btn-sm btn-circle btn-error"
                        title="Delete Reaction"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedReaction && (
        <div className="mt-6 bg-base-100 p-4 rounded-lg shadow">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-bold">Reaction Details</h2>
            <button 
              className="btn btn-sm btn-ghost"
              onClick={() => setSelectedReaction(null)}
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-base-content/70">Reaction ID:</p>
              <p>{selectedReaction.id}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Type:</p>
              <span className={`badge ${getReactionBadgeColor(selectedReaction.type)}`}>
                {getReactionIcon(selectedReaction.type)} {selectedReaction.type}
              </span>
            </div>
            <div>
              <p className="text-sm text-base-content/70">User:</p>
              <p>{selectedReaction.username} (ID: {selectedReaction.userId})</p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Target:</p>
              <p>
                {selectedReaction.postTitle ? (
                  <span>Post: {selectedReaction.postTitle} (ID: {selectedReaction.postId})</span>
                ) : selectedReaction.commentId ? (
                  <div>
                    <p>Comment: {selectedReaction.commentContent}</p>
                    <p className="text-sm opacity-50">ID: {selectedReaction.commentId}</p>
                    <p className="text-sm opacity-50">Author: {selectedReaction.commentAuthorUsername} (ID: {selectedReaction.commentAuthorId})</p>
                  </div>
                ) : (
                  <span>N/A</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Date:</p>
              <p>{formatDate(selectedReaction.timestamp)}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button 
              className="btn btn-sm btn-warning"
              onClick={() => {
                handleEditReaction(selectedReaction);
                setSelectedReaction(null);
              }}
            >
              <MdEdit className="mr-1" /> Edit Reaction
            </button>
            <button 
              className="btn btn-sm btn-error"
              onClick={() => {
                handleDeleteReaction(selectedReaction.id);
              }}
            >
              <MdDelete className="mr-1" /> Delete Reaction
            </button>
            {selectedReaction.postId && (
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => selectedReaction.postId && handleViewPost(selectedReaction.postId)}
              >
                View Post
              </button>
            )}
            {selectedReaction.commentId && (
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => selectedReaction.commentId && handleViewComment(selectedReaction.commentId)}
              >
                View Comment
              </button>
            )}
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => window.open(`/users/${selectedReaction.userId}`, '_blank')}
            >
              View User
            </button>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && selectedPostId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Post Details</h2>
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => setShowPostModal(false)}
              >
                <MdClose />
              </button>
            </div>
            <div className="space-y-4">
              {isLoadingPost ? (
                <div className="flex justify-center items-center h-24">
                  <div className="loading loading-spinner loading-md"></div>
                </div>
              ) : selectedPost ? (
                <>
                  <div>
                    <p className="text-sm text-base-content/70">Title:</p>
                    <p className="font-medium">{selectedPost.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Post ID:</p>
                    <p>{selectedPost.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Author:</p>
                    <p>{selectedPost.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Content:</p>
                    <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Created At:</p>
                    <p>{formatDate(selectedPost.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Category:</p>
                    <p>{selectedPost.category}</p>
                  </div>
                </>
              ) : (
                <div className="text-center text-error">Failed to load post details</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedCommentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Comment Details</h2>
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => setShowCommentModal(false)}
              >
                <MdClose />
              </button>
            </div>
            <div className="space-y-4">
              {isLoadingComment ? (
                <div className="flex justify-center items-center h-24">
                  <div className="loading loading-spinner loading-md"></div>
                </div>
              ) : selectedComment ? (
                <>
                  <div>
                    <p className="text-sm text-base-content/70">Content:</p>
                    <p className="whitespace-pre-wrap">{selectedComment.content}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Comment ID:</p>
                    <p>{selectedComment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Author:</p>
                    <p>{selectedComment.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Post:</p>
                    <p>{reactions.find(r => r.commentId === selectedCommentId)?.postTitle || 'Unknown Post'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/70">Created At:</p>
                    <p>{formatDate(selectedComment.createdAt)}</p>
                  </div>
                </>
              ) : (
                <div className="text-center text-error">Failed to load comment details</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReactions; 