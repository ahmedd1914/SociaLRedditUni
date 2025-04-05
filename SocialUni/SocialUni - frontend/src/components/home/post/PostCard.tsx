import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { HiOutlineChatAlt } from 'react-icons/hi';
import { BsBookmark } from 'react-icons/bs';
import { FaRegThumbsUp, FaThumbsUp, FaHeart, FaLaugh, FaSurprise, FaRegSadTear, FaAngry } from 'react-icons/fa';
import { PostResponseDto, UsersDto, ReactionType, ReactionResponseDto } from '../../../api/interfaces';
import API from '../../../api/api';
import { toast } from 'react-hot-toast';

interface PostCardProps {
  post: PostResponseDto;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const commentCount = post.comments?.length || 0;
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionResponseDto | null>(null);
  const [reactionCount, setReactionCount] = useState(post.reactionCount || 0);
  const [userProfile, setUserProfile] = useState<UsersDto | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReaction, setLoadingReaction] = useState(true);
  const reactionRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isHoveringReaction, setIsHoveringReaction] = useState(false);
  const [isHoveringPopup, setIsHoveringPopup] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        // First, get all users and find the one with matching username
        const users = await API.fetchAllUsers();
        const user = users.find(u => u.username === post.username);
        if (user) {
          setUserProfile(user);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [post.username]);

  useEffect(() => {
    const fetchUserReaction = async () => {
      if (!isAuthenticated) {
        setLoadingReaction(false);
        return;
      }

      try {
        setLoadingReaction(true);
        const reaction = await API.getUserReaction(post.id);
        if (reaction) {
          setUserReaction(reaction);
          console.log("User reaction fetched:", reaction);
        } else {
          setUserReaction(null);
        }
      } catch (error) {
        console.error('Error fetching user reaction:', error);
        setUserReaction(null);
      } finally {
        setLoadingReaction(false);
      }
    };

    fetchUserReaction();
  }, [post.id, isAuthenticated]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  const handleReactionClick = async (type: ReactionType) => {
    try {
      if (userReaction) {
        if (userReaction.type === type) {
          // Remove reaction if clicking the same type
          await API.removeReaction(post.id);
          setUserReaction(null);
          setReactionCount(prev => Math.max(0, prev - 1));
          setShowReactionPopup(false);
        } else {
          // Change reaction type (updates existing reaction rather than removing it)
          await API.addReaction(post.id, type);
          // Update the user reaction with the new type
          setUserReaction(prev => {
            if (!prev) return null;
            return {
              ...prev,
              type: type,
              timestamp: new Date().toISOString() // Update timestamp to reflect the change
            };
          });
          setShowReactionPopup(false);
        }
      } else {
        // Add new reaction
        await API.addReaction(post.id, type);
        // Create a new reaction object
        const newReaction: ReactionResponseDto = {
          id: 0,
          type,
          userId: user?.id || 0,
          username: user?.username || '',
          timestamp: new Date().toISOString(),
          postId: post.id
        };
        setUserReaction(newReaction);
        setReactionCount(prev => prev + 1);
        setShowReactionPopup(false);
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast.error("Failed to update reaction");
    }
  };

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on a link or reaction button
    if (
      (e.target as HTMLElement).closest('a') || 
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('.reaction-popup')
    ) {
      return;
    }
    navigate(`/posts/${post.id}`);
  };

  // Show popup when hovering over reaction button
  const handleReactionMouseEnter = () => {
    setIsHoveringReaction(true);
    setShowReactionPopup(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Handle mouse leave from reaction button
  const handleReactionMouseLeave = () => {
    setIsHoveringReaction(false);
    
    // Start a timeout to hide the popup if not hovering over it
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringPopup) {
        setShowReactionPopup(false);
      }
    }, 50); // Decreased timeout from 300ms to 150ms
  };

  // Handle mouse enter on popup
  const handlePopupMouseEnter = () => {
    setIsHoveringPopup(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Handle mouse leave from popup
  const handlePopupMouseLeave = () => {
    setIsHoveringPopup(false);
    
    // Start a timeout to hide the popup if not hovering over reaction button
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringReaction) {
        setShowReactionPopup(false);
      }
    }, 50); // Decreased timeout from 300ms to 150ms
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-4">
      {/* Post Header */}
      <div className="flex items-center gap-2 mb-3">
        <Link 
          to={`/profile/${post.username}`}
          className="avatar placeholder"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-primary text-primary-content rounded-full w-8">
            {loadingProfile ? (
              <div className="loading loading-spinner loading-xs"></div>
            ) : userProfile?.imgUrl ? (
              <img src={userProfile.imgUrl} alt={post.username} className="rounded-full" />
            ) : (
              <span className="text-xs">{post.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link 
            to={`/profile/${post.username}`}
            className="font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {post.username}
          </Link>
          <div className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
        </div>
        <span className="badge badge-ghost">{post.category}</span>
      </div>

      {/* Post Content */}
      <div 
        className="block mb-3 cursor-pointer"
        onClick={handlePostClick}
      >
        <h3 className="text-lg font-semibold mb-2 hover:text-primary">
          {post.title}
        </h3>
        <p className="text-base-content/80 line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-4 text-base-content/60">
        <div className="relative" ref={reactionRef}>
          <button
            className="btn btn-ghost btn-sm gap-1"
            onMouseEnter={handleReactionMouseEnter}
            onMouseLeave={handleReactionMouseLeave}
            onClick={(e) => {
              e.stopPropagation();
              // Main button now always removes the reaction if one exists
              if (userReaction) {
                API.removeReaction(post.id)
                  .then(() => {
                    setUserReaction(null);
                    setReactionCount(prev => Math.max(0, prev - 1));
                  })
                  .catch(error => {
                    console.error("Error removing reaction:", error);
                    toast.error("Failed to remove reaction");
                  });
              } else {
                // If no reaction exists, use the default LIKE
                handleReactionClick(ReactionType.LIKE);
              }
            }}
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
          
          {showReactionPopup && (
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
                      userReaction?.type === reaction.type 
                        ? 'scale-110' 
                        : ''
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
        
        <Link 
          to={`/posts/${post.id}`}
          className="flex items-center gap-1 hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <HiOutlineChatAlt className="w-4 h-4" />
          <span>{commentCount}</span>
        </Link>
        
        {isAuthenticated && (
          <button className="flex items-center gap-1 hover:text-primary ml-auto">
            <BsBookmark className="w-4 h-4" />
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard; 