import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ReactionResponseDto, ReactionType } from '../../../api/interfaces';
import API from '../../../api/api';
import { toast } from 'react-hot-toast';
import { 
  FaThumbsUp, 
  FaHeart, 
  FaLaugh, 
  FaSurprise, 
  FaSadTear, 
  FaAngry 
} from 'react-icons/fa';

interface ReactionButtonProps {
  postId: number;
  initialReaction?: ReactionResponseDto | null;
  reactionCount?: number;
  isAuthenticated?: boolean;
  onReactionChange?: () => void;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({ 
  postId, 
  initialReaction, 
  reactionCount: initialReactionCount = 0,
  isAuthenticated: propIsAuthenticated,
  onReactionChange 
}) => {
  // Safely use the auth context with a try-catch to handle the case when it's not available
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // If useAuth throws an error, we'll use the prop value instead
    console.warn('AuthContext not available, using prop value for authentication');
  }
  
  // Use the prop value if provided, otherwise use the context value if available
  const isAuthenticated = propIsAuthenticated ?? authContext?.isAuthenticated ?? false;
  
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionResponseDto | null>(initialReaction || null);
  const [reactionCount, setReactionCount] = useState(initialReactionCount);
  const [loading, setLoading] = useState(false);
  const [postExists, setPostExists] = useState(true);
  const [authError, setAuthError] = useState(false);
  
  const buttonRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update reaction state when initial props change
  useEffect(() => {
    setUserReaction(initialReaction || null);
    setReactionCount(initialReactionCount);
  }, [initialReaction, initialReactionCount]);

  // Check if post exists on mount
  useEffect(() => {
    const checkPostExists = async () => {
      if (!postId) return;
      
      try {
        // Try to fetch the post to check if it exists
        await API.fetchPublicPostById(postId);
        setPostExists(true);
      } catch (error: any) {
        if (error?.status === 404) {
          setPostExists(false);
        }
      }
    };
    
    checkPostExists();
  }, [postId]);

  // Fetch user reaction when component mounts or dependencies change
  useEffect(() => {
    const fetchUserReaction = async () => {
      // Skip API call if:
      // 1. User is not authenticated
      // 2. Post doesn't exist
      // 3. There's an auth error
      // 4. We already have a reaction from props
      // 5. We're already loading
      if (!isAuthenticated || !postExists || authError || initialReaction !== undefined || loading) {
        return;
      }

      try {
        const reaction = await API.getUserReaction(postId);
        if (reaction) {
          setUserReaction(reaction);
          setAuthError(false);
        }
      } catch (error: any) {
        // Silently handle errors for reaction endpoints
        if (error?.status === 404) {
          setPostExists(false);
        } else if (error?.status === 403) {
          setAuthError(true);
        }
      }
    };

    fetchUserReaction();
  }, [postId, isAuthenticated, postExists, authError, initialReaction, loading]);

  // Handle mouse events for the reaction popup
  useEffect(() => {
    const handleMouseEnter = () => {
      if (!isAuthenticated || authError) return;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setShowReactionPopup(true);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setShowReactionPopup(false);
      }, 300);
    };

    const button = buttonRef.current;
    const popup = popupRef.current;

    if (button) {
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
    }

    if (popup) {
      popup.addEventListener('mouseenter', handleMouseEnter);
      popup.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (button) {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      }

      if (popup) {
        popup.removeEventListener('mouseenter', handleMouseEnter);
        popup.removeEventListener('mouseleave', handleMouseLeave);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, authError]);

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!postExists) {
      toast.error('This post is no longer available');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('Please log in to react to posts');
      return;
    }
    
    if (authError) {
      toast.error('Authentication error. Please try logging in again.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Optimistic update for better UX
      const isRemovingReaction = userReaction?.type === reactionType;
      
      if (isRemovingReaction) {
        // Remove reaction
        setUserReaction(null);
        setReactionCount(prev => Math.max(0, prev - 1));
        
        await API.removeReaction(postId);
      } else {
        // Add new reaction
        const tempReaction = {
          id: 0,
          postId: postId,
          userId: 0,
          type: reactionType,
          timestamp: new Date().toISOString(),
          username: ''
        };
        
        setUserReaction(tempReaction as ReactionResponseDto);
        
        // If there was a previous reaction, don't increment count
        if (!userReaction) {
          setReactionCount(prev => prev + 1);
        }
        
        await API.addReaction(postId, reactionType);
      }
      
      // Fetch the updated reaction to ensure consistency
      const updatedReaction = await API.getUserReaction(postId);
      if (updatedReaction) {
        setUserReaction(updatedReaction);
      } else {
        setUserReaction(null);
      }
      
      // Notify parent component
      onReactionChange?.();
    } catch (error: any) {
      // Revert optimistic update on error
      if (userReaction?.type === reactionType) {
        setUserReaction(userReaction);
        setReactionCount(prev => prev + 1);
      } else if (userReaction) {
        setUserReaction(null);
        setReactionCount(prev => Math.max(0, prev - 1));
      }
      
      if (error?.status === 403) {
        setAuthError(true);
        toast.error('Authentication error. Please try logging in again.');
      } else if (error?.status === 404) {
        setPostExists(false);
        toast.error('This post is no longer available');
      } else {
        toast.error('Failed to update reaction. Please try again.');
      }
    } finally {
      setLoading(false);
      setShowReactionPopup(false);
    }
  };

  const getReactionIcon = () => {
    if (!userReaction) return <FaThumbsUp className="w-4 h-4" />;
    
    switch (userReaction.type as ReactionType) {
      case ReactionType.LIKE: return <FaThumbsUp className="w-4 h-4" />;
      case ReactionType.LOVE: return <FaHeart className="w-4 h-4" />;
      case ReactionType.HAHA: return <FaLaugh className="w-4 h-4" />;
      case ReactionType.WOW: return <FaSurprise className="w-4 h-4" />;
      case ReactionType.SAD: return <FaSadTear className="w-4 h-4" />;
      case ReactionType.ANGRY: return <FaAngry className="w-4 h-4" />;
      default: return <FaThumbsUp className="w-4 h-4" />;
    }
  };

  const getReactionColor = () => {
    if (!userReaction) return 'text-gray-500';
    
    switch (userReaction.type as ReactionType) {
      case ReactionType.LIKE: return 'text-blue-500';
      case ReactionType.LOVE: return 'text-red-500';
      case ReactionType.HAHA: return 'text-yellow-500';
      case ReactionType.WOW: return 'text-purple-500';
      case ReactionType.SAD: return 'text-blue-300';
      case ReactionType.ANGRY: return 'text-red-700';
      default: return 'text-gray-500';
    }
  };

  if (!postExists) {
    return null;
  }

  return (
    <div className="relative" ref={buttonRef}>
      <button
        className={`flex items-center gap-1 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleReactionClick((userReaction?.type as ReactionType) || ReactionType.LIKE)}
        disabled={loading || authError}
      >
        <span className={getReactionColor()}>
          {getReactionIcon()}
        </span>
        <span>{reactionCount}</span>
      </button>
      
      {isAuthenticated && !authError && (
        <div 
          className={`reaction-popup absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 flex gap-1 ${showReactionPopup ? 'block' : 'hidden'}`}
          ref={popupRef}
        >
          <button 
            className={`p-2 rounded-full hover:bg-gray-100 ${userReaction?.type === ReactionType.LIKE ? 'bg-blue-100' : ''}`}
            onClick={() => handleReactionClick(ReactionType.LIKE)}
            disabled={loading}
          >
            <FaThumbsUp className="w-4 h-4 text-blue-500" />
          </button>
          <button 
            className={`p-2 rounded-full hover:bg-gray-100 ${userReaction?.type === ReactionType.LOVE ? 'bg-red-100' : ''}`}
            onClick={() => handleReactionClick(ReactionType.LOVE)}
            disabled={loading}
          >
            <FaHeart className="w-4 h-4 text-red-500" />
          </button>
          <button 
            className={`p-2 rounded-full hover:bg-gray-100 ${userReaction?.type === ReactionType.HAHA ? 'bg-yellow-100' : ''}`}
            onClick={() => handleReactionClick(ReactionType.HAHA)}
            disabled={loading}
          >
            <FaLaugh className="w-4 h-4 text-yellow-500" />
          </button>
          <button 
            className={`p-2 rounded-full hover:bg-gray-100 ${userReaction?.type === ReactionType.WOW ? 'bg-purple-100' : ''}`}
            onClick={() => handleReactionClick(ReactionType.WOW)}
            disabled={loading}
          >
            <FaSurprise className="w-4 h-4 text-purple-500" />
          </button>
          <button 
            className={`p-2 rounded-full hover:bg-gray-100 ${userReaction?.type === ReactionType.SAD ? 'bg-blue-100' : ''}`}
            onClick={() => handleReactionClick(ReactionType.SAD)}
            disabled={loading}
          >
            <FaSadTear className="w-4 h-4 text-blue-300" />
          </button>
          <button 
            className={`p-2 rounded-full hover:bg-gray-100 ${userReaction?.type === ReactionType.ANGRY ? 'bg-red-100' : ''}`}
            onClick={() => handleReactionClick(ReactionType.ANGRY)}
            disabled={loading}
          >
            <FaAngry className="w-4 h-4 text-red-700" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactionButton;
