import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { API } from '../api/api';
import { FaUsers, FaShieldAlt, FaUserPlus, FaHeart, FaComment } from 'react-icons/fa';
import { MdPublic, MdLock } from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import { Visibility, Category, PostResponseDto } from '../api/interfaces';
import toast from 'react-hot-toast';

// Simple PostItem component
const PostItem = ({ post, onClick }: { post: PostResponseDto, onClick?: () => void }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/posts/${post.id}`);
    }
  };
  
  // Format date to relative time
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  return (
    <div 
      className="bg-base-100 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-center mb-3">
          <div className="avatar mr-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
              {post.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          <div>
            <p className="font-medium">{post.username || "Unknown User"}</p>
            <p className="text-xs text-gray-500">
              {post.createdAt ? getTimeAgo(post.createdAt) : 'Unknown time'}
            </p>
          </div>
        </div>

        {/* Post Title */}
        <h3 className="text-lg font-bold mb-2">{post.title}</h3>
        
        {/* Post Preview Content */}
        <p className="text-base-content mb-3 line-clamp-3">
          {post.content}
        </p>
        
        {/* Post Image if exists */}
        {post.image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-auto object-cover max-h-[200px]"
            />
          </div>
        )}
        
        {/* Post Category Badge */}
        {post.category && (
          <div className="mb-3">
            <span className="badge badge-primary">
              {post.category}
            </span>
          </div>
        )}
        
        {/* Post Stats */}
        <div className="flex items-center justify-between pt-2 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <FaHeart className="mr-1 text-red-500" />
              {post.reactionCount || 0}
            </span>
            <span className="flex items-center">
              <FaComment className="mr-1 text-blue-500" />
              {post.comments?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);

  // Convert groupId to number
  const groupIdNum = groupId ? parseInt(groupId, 10) : 0;

  // Fetch group data
  const { data: group, isLoading: groupLoading, error: groupError } = useQuery({
    queryKey: ['group', groupIdNum],
    queryFn: () => API.fetchGroupById(groupIdNum),
    enabled: !!groupIdNum && groupIdNum > 0,
  });

  // Fetch group posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['groupPosts', groupIdNum],
    queryFn: () => API.fetchPostsByGroup(groupIdNum),
    enabled: !!groupIdNum && groupIdNum > 0 && !!group,
  });

  const handleJoinGroup = async () => {
    if (!user) {
      toast.error('You must be logged in to join a group');
      return;
    }

    setIsJoining(true);

    try {
      await API.joinGroup(groupIdNum);
      toast.success(`Successfully joined ${group?.name}`);
      // Refetch group data to update members
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (groupLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="bg-base-100 rounded-xl shadow-md p-8 text-center">
        <h3 className="text-xl font-semibold text-error mb-2">Error loading group</h3>
        <p className="text-gray-500 mb-4">The group you're looking for doesn't exist or has been deleted.</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/groups')}
        >
          Back to Groups
        </button>
      </div>
    );
  }

  const isGroupAdmin = group.adminIds?.includes(user?.id || 0);
  const isGroupOwner = group.ownerId === user?.id;
  const isGroupMember = group.memberIds?.includes(user?.id || 0);

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-10">
      {/* Group Header */}
      <div className="bg-base-100 rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <div className="flex items-center mt-2">
                {group.visibility === Visibility.PUBLIC ? (
                  <MdPublic className="text-primary mr-2" />
                ) : (
                  <MdLock className="text-primary mr-2" />
                )}
                <span className="text-sm">{group.visibility === Visibility.PUBLIC ? 'Public Group' : 'Private Group'}</span>
                <div className="mx-2">•</div>
                <FaUsers className="mr-1" />
                <span className="text-sm">{group.memberCount} members</span>
              </div>
            </div>
            
            {isGroupMember ? (
              <button className="btn btn-outline btn-sm">
                Joined
              </button>
            ) : (
              <button 
                className={`btn btn-primary btn-sm ${isJoining ? 'loading' : ''}`}
                onClick={handleJoinGroup}
                disabled={isJoining}
              >
                {!isJoining && <FaUserPlus className="mr-1" />}
                {isJoining ? 'Joining...' : 'Join Group'}
              </button>
            )}
          </div>
          
          <p className="text-base-content">{group.description}</p>
          
          <div className="mt-4">
            <span className="badge badge-primary">{group.category}</span>
          </div>
          
          {/* Group Admins */}
          <div className="mt-6 pt-4 border-t border-base-300">
            <div className="flex items-center mb-2">
              <FaShieldAlt className="text-primary mr-2" />
              <h3 className="font-medium">Admins</h3>
            </div>
            {isGroupOwner && (
              <div className="badge badge-primary badge-outline mr-2">Owner</div>
            )}
            {isGroupAdmin && !isGroupOwner && (
              <div className="badge badge-secondary badge-outline mr-2">Admin</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Group Posts */}
      <div className="bg-base-100 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Group Posts</h2>
        
        {postsLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts in this group yet.</p>
            {isGroupMember && (
              <button 
                className="btn btn-primary mt-4"
                onClick={() => navigate('/posts/create')}
              >
                Create First Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPage; 