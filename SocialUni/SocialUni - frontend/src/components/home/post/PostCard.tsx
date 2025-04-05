import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { HiOutlineChatAlt } from 'react-icons/hi';
import { BsBookmark } from 'react-icons/bs';
import { PostResponseDto, UsersDto, ReactionResponseDto } from '../../../api/interfaces';
import { Role } from '../../../api/interfaces';
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
  // Safely use the auth context with a try-catch to handle the case when it's not available
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // If useAuth throws an error, we'll use the prop value instead
    console.warn('AuthContext not available, using prop value for authentication');
  }
  
  const navigate = useNavigate();
  const commentCount = post.comments?.length || 0;
  const [userProfile, setUserProfile] = useState<UsersDto | null>(initialUserProfile || null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionResponseDto | null>(null);
  const [postExists, setPostExists] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [reactionError, setReactionError] = useState(false);
  
  // Use the prop value if provided, otherwise use the context value if available
  const isAuthenticated = propIsAuthenticated ?? authContext?.isAuthenticated ?? false;
  const user = authContext?.user;

  // Memoize the fetchUserProfile function to prevent unnecessary re-renders
  const fetchUserProfile = useCallback(async () => {
    // Skip API call if:
    // 1. Already have profile
    // 2. Post doesn't exist
    // 3. Had a previous error
    // 4. Already loading
    // 5. Username matches current user
    if (userProfile || 
        !postExists || 
        profileError || 
        loadingProfile ||
        post.username === user?.username) {
      return;
    }
    
    setLoadingProfile(true);
    try {
      const fetchedProfile = await API.fetchPublicUserProfile(post.username);
      if (fetchedProfile) {
        // Convert the public profile to match our component's needs
        setUserProfile({
          id: 0, // Not needed for display
          username: fetchedProfile.username,
          email: '', // Not needed for display
          role: Role.USER, // Not needed for display
          fname: fetchedProfile.firstName,
          lname: fetchedProfile.lastName,
          enabled: true, // Not needed for display
          lastLogin: '', // Not needed for display
          createdAt: '', // Not needed for display
          imgUrl: fetchedProfile.imageUrl
        });
        setProfileError(false);
      } else {
        // If user profile is null, set profile error to prevent further attempts
        setProfileError(true);
      }
    } catch (error: any) {
      // Silently handle errors for user profile endpoints
      setProfileError(true);
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [post.username, userProfile, postExists, profileError, loadingProfile, user?.username]);

  // Memoize the fetchUserReaction function to prevent unnecessary re-renders
  const fetchUserReaction = useCallback(async () => {
    // Only fetch if authenticated and post exists and no errors
    if (!isAuthenticated || !postExists || reactionError || userReaction !== null) {
      return;
    }

    try {
      const reaction = await API.getUserReaction(post.id);
      if (reaction) {
        setUserReaction(reaction);
        setReactionError(false);
      }
    } catch (error: any) {
      // Silently handle errors for reaction endpoints
      if (error?.status === 404) {
        setPostExists(false);
      } else if (error?.status === 403) {
        setReactionError(true);
      }
      setUserReaction(null);
    }
  }, [post.id, isAuthenticated, postExists, reactionError, userReaction]);

  // Check if post exists on mount
  useEffect(() => {
    const checkPostExists = async () => {
      if (!post.id) return;
      
      try {
        // Try to fetch the post to check if it exists
        const publicPost = await API.fetchPublicPostById(post.id);
        setPostExists(publicPost !== null);
      } catch (error: any) {
        setPostExists(false);
      }
    };
    
    checkPostExists();
  }, [post.id]);

  // Fetch user profile and reaction when component mounts or dependencies change
  useEffect(() => {
    // Only fetch if:
    // 1. We don't have the profile yet
    // 2. No profile errors
    // 3. Post exists
    // 4. Not the current user's profile
    if (!userProfile && !profileError && postExists && post.username !== user?.username) {
      fetchUserProfile();
    }
    
    // Only fetch reaction if:
    // 1. User is authenticated
    // 2. Post exists
    // 3. No reaction errors
    // 4. No reaction yet
    if (isAuthenticated && postExists && !reactionError && userReaction === null) {
      fetchUserReaction();
    }
  }, [fetchUserProfile, fetchUserReaction, userProfile, userReaction, profileError, reactionError, postExists, post.username, user?.username, isAuthenticated]);

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
            onClick={(e) => {
              e.stopPropagation();
              if (!postExists) {
                e.preventDefault();
                toast.error('This post is no longer available');
              }
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