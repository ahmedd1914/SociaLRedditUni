import React, { useState } from 'react';
import { MdThumbUp, MdDelete, MdVisibility, MdThumbDown, MdOutlineBarChart } from 'react-icons/md';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllReactionsAdmin, deleteReactionAsAdmin, getReactionStats } from '../api/ApiCollection';
import { ReactionResponseDto, ReactionStats } from '../api/interfaces';
import toast from 'react-hot-toast';

const AdminReactions = () => {
  const [selectedReaction, setSelectedReaction] = useState<ReactionResponseDto | null>(null);
  const [showStats, setShowStats] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all reactions from backend
  const { 
    data: reactions = [], 
    isLoading, 
    isError 
  } = useQuery<ReactionResponseDto[]>({
    queryKey: ['adminReactions'],
    queryFn: fetchAllReactionsAdmin
  });

  // Fetch reaction statistics
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError
  } = useQuery<ReactionStats>({
    queryKey: ['reactionStats'],
    queryFn: getReactionStats,
    enabled: showStats
  });

  // Delete reaction mutation
  const deleteReactionMutation = useMutation({
    mutationFn: (reactionId: number) => deleteReactionAsAdmin(reactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReactions'] });
      queryClient.invalidateQueries({ queryKey: ['reactionStats'] });
      toast.success('Reaction deleted successfully');
      setSelectedReaction(null);
    },
    onError: (error) => {
      console.error('Error deleting reaction:', error);
      toast.error('Failed to delete reaction');
    }
  });

  const handleViewReaction = (reaction: ReactionResponseDto) => {
    setSelectedReaction(reaction);
  };

  const handleDeleteReaction = (id: number) => {
    if (window.confirm('Are you sure you want to delete this reaction?')) {
      deleteReactionMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'UPVOTE':
        return <MdThumbUp className="text-success" />;
      case 'DOWNVOTE':
        return <MdThumbDown className="text-error" />;
      case 'LIKE':
        return <MdThumbUp className="text-primary" />;
      default:
        return <MdThumbUp className="text-secondary" />;
    }
  };

  const getReactionBadgeColor = (type: string) => {
    switch (type) {
      case 'UPVOTE':
        return 'badge-success';
      case 'DOWNVOTE':
        return 'badge-error';
      case 'LIKE':
        return 'badge-primary';
      case 'LOVE':
        return 'badge-secondary';
      case 'ANGRY':
        return 'badge-warning';
      case 'SAD':
        return 'badge-info';
      case 'LAUGH':
        return 'badge-accent';
      default:
        return 'badge-neutral';
    }
  };

  const toggleStats = () => {
    setShowStats(!showStats);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MdThumbUp className="text-2xl mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Admin Reactions</h1>
        </div>
        <button
          className={`btn btn-sm ${showStats ? 'btn-primary' : 'btn-outline'}`}
          onClick={toggleStats}
        >
          <MdOutlineBarChart className="mr-1" />
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title">Total</div>
                  <div className="stat-value text-2xl">{stats.totalReactions}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title">Upvotes</div>
                  <div className="stat-value text-2xl text-success">{stats.upvotes}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title">Downvotes</div>
                  <div className="stat-value text-2xl text-error">{stats.downvotes}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title">Likes</div>
                  <div className="stat-value text-2xl text-primary">{stats.likes}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title">Other</div>
                  <div className="stat-value text-2xl">
                    {stats.totalReactions - stats.upvotes - stats.downvotes - stats.likes}
                  </div>
                </div>
              </div>
              {stats.mostActivePost && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-base-200 rounded-lg p-3">
                    <div className="text-sm opacity-70">Most Active Post</div>
                    <div className="font-semibold">{stats.mostActivePost.title}</div>
                    <div className="text-sm">
                      {stats.mostActivePost.reactionCount} reactions
                    </div>
                  </div>
                  <div className="bg-base-200 rounded-lg p-3">
                    <div className="text-sm opacity-70">Most Active User</div>
                    <div className="font-semibold">{stats.mostActiveUser.username}</div>
                    <div className="text-sm">
                      {stats.mostActiveUser.reactionCount} reactions
                    </div>
                  </div>
                </div>
              )}
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
        ) : reactions.length === 0 ? (
          <div className="text-center p-6">
            <p>No reactions found.</p>
          </div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Post</th>
                <th>Type</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reactions.map((reaction) => (
                <tr key={reaction.id}>
                  <td>{reaction.id}</td>
                  <td>{reaction.username}</td>
                  <td>{reaction.postTitle}</td>
                  <td>
                    <span className={`badge ${getReactionBadgeColor(reaction.type)}`}>
                      {getReactionIcon(reaction.type)} {reaction.type}
                    </span>
                  </td>
                  <td>{formatDate(reaction.timestamp)}</td>
                  <td className="flex gap-2">
                    <button
                      onClick={() => handleViewReaction(reaction)}
                      className="btn btn-sm btn-primary btn-circle"
                    >
                      <MdVisibility />
                    </button>
                    <button
                      onClick={() => handleDeleteReaction(reaction.id)}
                      className="btn btn-sm btn-error btn-circle"
                    >
                      <MdDelete />
                    </button>
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
              <p className="text-sm text-base-content/70">Post:</p>
              <p>{selectedReaction.postTitle} (ID: {selectedReaction.postId})</p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Date:</p>
              <p>{formatDate(selectedReaction.timestamp)}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button 
              className="btn btn-sm btn-error"
              onClick={() => {
                handleDeleteReaction(selectedReaction.id);
              }}
            >
              <MdDelete className="mr-1" /> Delete Reaction
            </button>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => window.open(`/admin/posts/${selectedReaction.postId}`, '_blank')}
            >
              View Post
            </button>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => window.open(`/admin/users/${selectedReaction.userId}`, '_blank')}
            >
              View User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReactions; 