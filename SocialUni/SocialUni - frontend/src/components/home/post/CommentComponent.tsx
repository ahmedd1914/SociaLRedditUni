import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CommentResponseDto, ReactionType, ReactionResponseDto } from '../../../api/interfaces';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { FaRegThumbsUp, FaThumbsUp, FaHeart, FaLaugh, FaSurprise, FaRegSadTear, FaAngry } from 'react-icons/fa';
import { HiOutlineReply } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import API from '../../../api/api';

interface CommentComponentProps {
  comment: CommentResponseDto;
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

const CommentComponent: React.FC<CommentComponentProps> = ({
  comment,
  isAuthenticated
}) => {
  const [userReaction, setUserReaction] = useState<ReactionResponseDto | null>(null);
  const [reactionCount, setReactionCount] = useState(comment.reactionCount || 0);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [isHoveringReaction, setIsHoveringReaction] = useState(false);
  const [isHoveringPopup, setIsHoveringPopup] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReactionClick = async (type: ReactionType) => {
    if (!isAuthenticated) {
      toast.error('Please log in to react to comments');
      return;
    }
    
    try {
      if (userReaction) {
        if (userReaction.type === type) {
          await API.removeReaction(comment.id);
          setUserReaction(null);
          setReactionCount(prev => Math.max(0, prev - 1));
          setShowReactionPopup(false);
        } else {
          await API.addReaction(comment.id, type);
          setUserReaction({
            ...userReaction,
            type: type,
            timestamp: new Date().toISOString()
          });
          setShowReactionPopup(false);
        }
      } else {
        await API.addReaction(comment.id, type);
        const newReaction: ReactionResponseDto = {
          id: 0,
          type,
          userId: 0, // Will be set by server
          username: '',
          timestamp: new Date().toISOString(),
          postId: comment.postId,
          commentId: comment.id
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

  const handleReply = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to reply to comments');
      return;
    }
    setShowReplyForm(true);
  };

  return (
    <div className="bg-base-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-600">
            {comment.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <Link to={`/profile/${comment.username}`} className="font-semibold hover:underline">
            {comment.username}
          </Link>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      <p className="text-base-content/80 mb-3 whitespace-pre-wrap">{comment.content}</p>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            className="btn btn-ghost btn-xs gap-1"
            onMouseEnter={handleReactionMouseEnter}
            onMouseLeave={handleReactionMouseLeave}
            onClick={() => {
              if (!isAuthenticated) {
                toast.error('Please log in to react to comments');
                return;
              }
              
              if (userReaction) {
                handleReactionClick(userReaction.type as ReactionType);
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

        <button
          className="btn btn-ghost btn-xs gap-1"
          onClick={handleReply}
        >
          <HiOutlineReply className="w-4 h-4" />
          Reply
        </button>
      </div>

      {showReplyForm && (
        <div className="mt-4">
          <textarea
            className="textarea textarea-bordered w-full h-20 text-sm"
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary btn-xs"
              disabled={!replyContent.trim()}
              onClick={() => {
                // TODO: Implement reply submission
                toast.success('Reply added successfully');
                setShowReplyForm(false);
                setReplyContent('');
              }}
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Nested comments */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentComponent
              key={reply.id}
              comment={reply}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentComponent; 