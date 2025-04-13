import React from 'react';
import { Link } from 'react-router-dom';
import { PostResponseDto, UsersDto, CommentResponseDto } from '../../../api/interfaces';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { HiOutlineChatAlt } from 'react-icons/hi';
import { BsBookmark } from 'react-icons/bs';
import ReactionButton from './ReactionButton';

interface MainPostComponentProps {
  post: PostResponseDto;
  userProfile: UsersDto | null;
  userReaction: any | null;
  reactionCount: number;
  setUserReaction: (reaction: any | null) => void;
  setReactionCount: (count: number) => void;
  isAuthenticated: boolean;
}

const countTotalComments = (comments: CommentResponseDto[]): number => {
  return comments.reduce((total, comment) => {
    // Count the current comment
    let count = 1;
    // Add the count of all replies recursively
    if (comment.replies && comment.replies.length > 0) {
      count += countTotalComments(comment.replies);
    }
    return total + count;
  }, 0);
};

const MainPostComponent: React.FC<MainPostComponentProps> = ({
  post,
  userProfile,
  userReaction,
  reactionCount,
  setUserReaction,
  setReactionCount,
  isAuthenticated
}) => {
  const totalComments = post.comments ? countTotalComments(post.comments) : 0;

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
      </div>

      {/* Post Content */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="text-base-content/80 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-4 text-base-content/60 border-t border-base-300 pt-4">
        <ReactionButton
          postId={post.id}
          initialReaction={userReaction}
          reactionCount={reactionCount}
          isAuthenticated={isAuthenticated}
          onReactionChange={() => {
            // This will be called when the reaction changes
            // The ReactionButton component handles the state updates internally
          }}
        />
        
        <div className="flex items-center gap-1 hover:text-primary transition-colors duration-200">
          <HiOutlineChatAlt className="w-4 h-4" />
          <span>{totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}</span>
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