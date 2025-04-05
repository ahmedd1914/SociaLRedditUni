import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PostResponseDto, UsersDto, ReactionType, ReactionResponseDto } from '../../../api/interfaces';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { HiOutlineChatAlt } from 'react-icons/hi';
import { BsBookmark } from 'react-icons/bs';
import { FaRegThumbsUp, FaThumbsUp, FaHeart, FaLaugh, FaSurprise, FaRegSadTear, FaAngry } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import API from '../../../api/api';

interface MainPostComponentProps {
  post: PostResponseDto;
  userProfile: UsersDto | null;
  userReaction: ReactionResponseDto | null;
  reactionCount: number;
  setUserReaction: (reaction: ReactionResponseDto | null) => void;
  setReactionCount: (count: number) => void;
  isAuthenticated: boolean;
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

const MainPostComponent: React.FC<MainPostComponentProps> = ({
  post,
  userProfile,
  userReaction,
  reactionCount,
  setUserReaction,
  setReactionCount,
  isAuthenticated
}) => {
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [isHoveringReaction, setIsHoveringReaction] = useState(false);
  const [isHoveringPopup, setIsHoveringPopup] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReactionClick = async (type: ReactionType) => {
    if (!isAuthenticated) {
      toast.error('Please log in to react to posts');
      return;
    }
    
    try {
      if (userReaction) {
        if (userReaction.type === type) {
          await API.removeReaction(post.id);
          setUserReaction(null);
          setReactionCount(prev => Math.max(0, prev - 1));
          setShowReactionPopup(false);
        } else {
          await API.addReaction(post.id, type);
          setUserReaction({
            ...userReaction,
            type: type,
            timestamp: new Date().toISOString()
          });
          setShowReactionPopup(false);
        }
      } else {
        await API.addReaction(post.id, type);
        const newReaction: ReactionResponseDto = {
          id: 0,
          type,
          userId: 0, // Will be set by server
          username: '',
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

  const handleReactionMouseEnter = () => {
    setIsHoveringReaction(true);
    setShowReactionPopup(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleReactionMouseLeave = () => {
    setIsHoveringReaction(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringPopup) {
        setShowReactionPopup(false);
      }
    }, 150);
  };

  const handlePopupMouseEnter = () => {
    setIsHoveringPopup(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handlePopupMouseLeave = () => {
    setIsHoveringPopup(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringReaction) {
        setShowReactionPopup(false);
      }
    }, 150);
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-6 mb-4">
      {/* Group and User Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
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
            <Link to={`/profile/${post.username}`} className="font-semibold text-gray-900 hover:underline">
              {userProfile?.fname || post.username}
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>@{post.username}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        {post.groupId && (
          <Link to={`/groups/${post.groupId}`} className="badge badge-primary">
            {post.groupId}
          </Link>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="text-base-content/80 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-4 text-base-content/60 border-t border-base-300 pt-4">
        <div className="relative">
          <button
            className="btn btn-ghost btn-sm gap-1"
            onMouseEnter={handleReactionMouseEnter}
            onMouseLeave={handleReactionMouseLeave}
            onClick={() => {
              if (!isAuthenticated) {
                toast.error('Please log in to react to posts');
                return;
              }
              
              if (userReaction) {
                handleReactionClick(userReaction.type);
              } else {
                handleReactionClick(ReactionType.LIKE);
              }
            }}
          >
            {userReaction ? (
              reactionTypes.find(r => r.type === userReaction.type)?.activeIcon
            ) : (
              <FaRegThumbsUp className="w-4 h-4 text-blue-500" />
            )}
            <span>{reactionCount}</span>
          </button>
          
          {showReactionPopup && (
            <div 
              className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg p-2 flex gap-2 reaction-popup z-10"
              onMouseEnter={handlePopupMouseEnter}
              onMouseLeave={handlePopupMouseLeave}
            >
              {reactionTypes.map((reaction) => (
                <div key={reaction.type} className="flex flex-col items-center">
                  <button
                    className={`transition-all duration-200 hover:scale-125 ${
                      userReaction?.type === reaction.type ? 'scale-110' : ''
                    }`}
                    onClick={() => handleReactionClick(reaction.type)}
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
        
        <div className="flex items-center gap-1">
          <HiOutlineChatAlt className="w-4 h-4" />
          <span>{post.comments?.length || 0} Comments</span>
        </div>
        
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

export default MainPostComponent; 