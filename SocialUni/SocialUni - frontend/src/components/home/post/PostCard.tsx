import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { HiOutlineChatAlt } from 'react-icons/hi';
import { BsBookmark } from 'react-icons/bs';
import { PostResponseDto, UsersDto, ReactionResponseDto } from '../../../api/interfaces';
import API from '../../../api/api';
import { toast } from 'react-hot-toast';
import ReactionButton from './ReactionButton';

interface PostCardProps {
  post: PostResponseDto;
  userProfile?: UsersDto;
  onRefresh?: () => void;
  onCommentClick?: () => void;
  isAuthenticated?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  userProfile: initialUserProfile, 
  onRefresh, 
  onCommentClick, 
  isAuthenticated: propIsAuthenticated 
}) => {
  const { isAuthenticated: authIsAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const commentCount = post.comments?.length || 0;
  const [userProfile, setUserProfile] = useState<UsersDto | null>(initialUserProfile || null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionResponseDto | null>(null);
  const [postExists, setPostExists] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [reactionError, setReactionError] = useState(false);
  const isAuthenticated = propIsAuthenticated ?? authIsAuthenticated;

  // Memoize the fetchUserProfile function to prevent unnecessary re-renders
  const fetchUserProfile = useCallback(async () => {
    // Only fetch if authenticated and we don't have the profile yet and no errors
    if (!isAuthenticated || userProfile || !postExists || profileError) {
      return;
    }
    
    setLoadingProfile(true);
    try {
      const user = await API.fetchUserProfileByUsername(post.username);
      setUserProfile(user);
      setProfileError(false);
    } catch (error: any) {
      if (error?.status === 404) {
        setPostExists(false);
      } else if (error?.status === 403) {
        setProfileError(true);
      } else if (error?.status !== 403) {
        console.error('Error fetching user profile:', error);
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [post.username, isAuthenticated, userProfile, postExists, profileError]);

  // Memoize the fetchUserReaction function to prevent unnecessary re-renders
  const fetchUserReaction = useCallback(async () => {
    // Only fetch if authenticated and post exists and no errors
    if (!isAuthenticated || !postExists || reactionError) {
      return;
    }

    try {
      const reaction = await API.getUserReaction(post.id);
      if (reaction) {
        setUserReaction(reaction);
        setReactionError(false);
      }
    } catch (error: any) {
      if (error?.status === 404) {
        setPostExists(false);
      } else if (error?.status === 403) {
        setReactionError(true);
      } else if (error?.status !== 403) {
        console.error('Error fetching user reaction:', error);
      }
      setUserReaction(null);
    }
  }, [post.id, isAuthenticated, postExists, reactionError]);

  // Check if post exists on mount
  useEffect(() => {
    const checkPostExists = async () => {
      if (!postExists) return;
      
      try {
        // Try to fetch the post to check if it exists
        await API.fetchPublicPostById(post.id);
        setPostExists(true);
      } catch (error: any) {
        if (error?.status === 404) {
          setPostExists(false);
        }
      }
    };
    
    checkPostExists();
  }, [post.id, postExists]);

  // Fetch user profile and reaction when component mounts or dependencies change
  useEffect(() => {
    fetchUserProfile();
    fetchUserReaction();
  }, [fetchUserProfile, fetchUserReaction]);

  const handleCommentClick = () => {
    if (!postExists) {
      toast.error('This post is no longer available');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please log in to comment on posts');
      return;
    }
    onCommentClick?.();
  };

  const handlePostClick = (e: React.MouseEvent) => {
    if (!postExists) {
      toast.error('This post is no longer available');
      return;
    }
    // Don't navigate if clicking on a link, button, or reaction popup
    if (
      (e.target as HTMLElement).closest('a') ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('.reaction-popup')
    ) {
      return;
    }
    navigate(`/posts/${post.id}`);
  };

  if (!postExists) {
    return null;
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link 
          to={`/profile/${post.username}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {userProfile?.imgUrl ? (
              <img
                src={userProfile.imgUrl}
                alt={post.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-semibold text-gray-600">
                {post.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {userProfile?.fname || post.username}
            </h2>
            <p className="text-sm text-gray-500">@{post.username}</p>
          </div>
        </Link>
        <div className="ml-auto">
          <span className="badge badge-ghost">{post.category}</span>
          <span className="text-sm text-gray-500 ml-2">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div 
        className="block mb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors duration-200"
        onClick={handlePostClick}
      >
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          {post.title}
        </h3>
        <p className="text-gray-700 line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-4 text-gray-600 border-t border-gray-100 pt-4">
        <ReactionButton
          postId={post.id}
          initialReaction={userReaction}
          reactionCount={post.reactionCount || 0}
          isAuthenticated={isAuthenticated}
          onReactionChange={onRefresh}
        />
        
        <Link 
          to={`/posts/${post.id}`}
          className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            if (!postExists) {
              e.preventDefault();
              toast.error('This post is no longer available');
            }
          }}
        >
          <HiOutlineChatAlt className="w-4 h-4" />
          <span>{commentCount}</span>
        </Link>
        
        {isAuthenticated && (
          <button 
            className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors duration-200 ml-auto"
            onClick={() => {
              if (!postExists) {
                toast.error('This post is no longer available');
                return;
              }
              // Save functionality implementation
            }}
          >
            <BsBookmark className="w-4 h-4" />
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard; 