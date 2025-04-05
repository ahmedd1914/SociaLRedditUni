import React, { useState, useRef, useEffect } from 'react';
import { FaRegThumbsUp, FaThumbsUp, FaHeart, FaLaugh, FaSurprise, FaRegSadTear, FaAngry } from 'react-icons/fa';
import { ReactionType, ReactionResponseDto } from '../../../api/interfaces';
import API from '../../../api/api';
import { toast } from 'react-hot-toast';

interface ReactionButtonProps {
  postId: number;
  initialReaction: ReactionResponseDto | null;
  reactionCount: number;
  isAuthenticated: boolean;
  onReactionChange?: () => void;
}

const reactionTypes = [
  { 
    type: ReactionType.LIKE, 
    icon: <FaRegThumbsUp className="w-4 h-4 text-blue-500" />, 
    activeIcon: <FaThumbsUp className="w-4 h-4 text-blue-500" />, 
    label: "Like" 
  },
  { 
    type: ReactionType.LOVE, 
    icon: <FaHeart className="w-4 h-4 text-red-500" />, 
    activeIcon: <FaHeart className="w-4 h-4 text-red-500" />, 
    label: "Love" 
  },
  { 
    type: ReactionType.HAHA, 
    icon: <FaLaugh className="w-4 h-4 text-yellow-500" />, 
    activeIcon: <FaLaugh className="w-4 h-4 text-yellow-500" />, 
    label: "Haha" 
  },
  { 
    type: ReactionType.WOW, 
    icon: <FaSurprise className="w-4 h-4 text-yellow-400" />, 
    activeIcon: <FaSurprise className="w-4 h-4 text-yellow-400" />, 
    label: "Wow" 
  },
  { 
    type: ReactionType.SAD, 
    icon: <FaRegSadTear className="w-4 h-4 text-blue-400" />, 
    activeIcon: <FaRegSadTear className="w-4 h-4 text-blue-400" />, 
    label: "Sad" 
  },
  { 
    type: ReactionType.ANGRY, 
    icon: <FaAngry className="w-4 h-4 text-red-600" />, 
    activeIcon: <FaAngry className="w-4 h-4 text-red-600" />, 
    label: "Angry" 
  }
];

const ReactionButton: React.FC<ReactionButtonProps> = ({
  postId,
  initialReaction,
  reactionCount: initialReactionCount,
  isAuthenticated,
  onReactionChange
}) => {
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionResponseDto | null>(initialReaction);
  const [reactionCount, setReactionCount] = useState(initialReactionCount);
  const [loadingReaction, setLoadingReaction] = useState(false);
  const [isHoveringReaction, setIsHoveringReaction] = useState(false);
  const [isHoveringPopup, setIsHoveringPopup] = useState(false);
  const [postExists, setPostExists] = useState(true);
  const [authError, setAuthError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reactionRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Update reaction state when initialReaction changes
  useEffect(() => {
    setUserReaction(initialReaction);
  }, [initialReaction]);

  // Update reaction count when initialReactionCount changes
  useEffect(() => {
    setReactionCount(initialReactionCount);
  }, [initialReactionCount]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Check if post exists on mount
  useEffect(() => {
    const checkPostExists = async () => {
      if (!isAuthenticated) return;
      
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
  }, [postId, isAuthenticated]);

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!postExists) {
      toast.error('This post is no longer available');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please log in to react to posts');
      setShowReactionPopup(false);
      setAuthError(true);
      return;
    }

    try {
      setLoadingReaction(true);
      setAuthError(false);
      
      // Optimistically update UI
      const isRemovingReaction = userReaction?.type === reactionType;
      const newReactionCount = isRemovingReaction 
        ? Math.max(0, reactionCount - 1) 
        : (userReaction ? reactionCount : reactionCount + 1);
      
      setReactionCount(newReactionCount);
      
      if (isRemovingReaction) {
        setUserReaction(null);
      } else {
        // Create a temporary reaction object for optimistic update
        const tempReaction: ReactionResponseDto = {
          id: 0,
          postId: postId,
          userId: 0,
          type: reactionType,
          timestamp: new Date().toISOString(),
          username: ''
        };
        setUserReaction(tempReaction);
      }
      
      // Make API call
      if (isRemovingReaction) {
        await API.removeReaction(postId);
      } else {
        await API.addReaction(postId, reactionType);
      }
      
      // Fetch updated reaction data
      try {
        const updatedReaction = await API.getUserReaction(postId);
        if (updatedReaction) {
          setUserReaction(updatedReaction);
        }
      } catch (error: any) {
        // If we can't fetch the updated reaction, keep our optimistic update
        if (error?.status === 403) {
          setAuthError(true);
          toast.error('Authentication error. Please log in again.');
        } else if (error?.status === 404) {
          setPostExists(false);
          toast.error('This post is no longer available');
        } else {
          console.error('Error fetching updated reaction:', error);
        }
      }
      
      onReactionChange?.();
    } catch (error: any) {
      // Revert optimistic updates on error
      setUserReaction(initialReaction);
      setReactionCount(initialReactionCount);
      
      if (error?.status === 404) {
        setPostExists(false);
        toast.error('This post is no longer available');
      } else if (error?.status === 403) {
        setAuthError(true);
        toast.error('Authentication error. Please log in again.');
      } else {
        console.error('Error handling reaction:', error);
        toast.error('Failed to update reaction');
      }
    } finally {
      setLoadingReaction(false);
      setShowReactionPopup(false);
    }
  };

  const handleReactionMouseEnter = () => {
    if (!isAuthenticated || !postExists || authError) return;
    
    setIsHoveringReaction(true);
    setShowReactionPopup(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleReactionMouseLeave = () => {
    if (!isAuthenticated || !postExists || authError) return;
    
    setIsHoveringReaction(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringPopup) {
        setShowReactionPopup(false);
      }
    }, 50);
  };

  const handlePopupMouseEnter = () => {
    if (!isAuthenticated || !postExists || authError) return;
    
    setIsHoveringPopup(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handlePopupMouseLeave = () => {
    if (!isAuthenticated || !postExists || authError) return;
    
    setIsHoveringPopup(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringReaction) {
        setShowReactionPopup(false);
      }
    }, 50);
  };

  if (!postExists) {
    return null;
  }

  return (
    <div className="relative" ref={reactionRef}>
      <button
        className={`btn btn-ghost btn-sm gap-2 hover:bg-gray-100 ${authError ? 'opacity-50 cursor-not-allowed' : ''}`}
        onMouseEnter={handleReactionMouseEnter}
        onMouseLeave={handleReactionMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          if (!postExists) {
            toast.error('This post is no longer available');
            return;
          }
          if (!isAuthenticated || authError) {
            toast.error('Please log in to react to posts');
            return;
          }
          if (userReaction) {
            handleReactionClick(userReaction.type as ReactionType);
          } else {
            handleReactionClick(ReactionType.LIKE);
          }
        }}
        disabled={authError}
      >
        {loadingReaction ? (
          <div className="loading loading-spinner loading-xs"></div>
        ) : userReaction ? (
          reactionTypes.find(r => r.type === userReaction.type)?.activeIcon
        ) : (
          <FaRegThumbsUp className="w-4 h-4 text-blue-500" />
        )}
        <span>{reactionCount}</span>
      </button>
      
      {showReactionPopup && !authError && (
        <div 
          className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg p-2 flex gap-2 reaction-popup z-10"
          ref={popupRef}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        >
          {reactionTypes.map((reaction) => (
            <div key={reaction.type} className="flex flex-col items-center">
              <button
                className={`transition-all duration-200 hover:scale-125 ${
                  userReaction?.type === reaction.type ? 'scale-110' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReactionClick(reaction.type);
                }}
                title={reaction.type}
              >
                {userReaction?.type === reaction.type ? reaction.activeIcon : reaction.icon}
              </button>
              <span className="text-xs mt-1 text-gray-500">{reaction.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionButton;
