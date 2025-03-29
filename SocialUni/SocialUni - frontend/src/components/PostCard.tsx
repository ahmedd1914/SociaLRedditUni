import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PostResponseDto } from '../api/interfaces';
import { FaComment, FaHeart } from 'react-icons/fa';
import { timeAgo } from '../utils/dateUtils';

interface PostCardProps {
  post: PostResponseDto;
  onClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/posts/${post.id}`);
    }
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
              {post.createdAt ? timeAgo(new Date(post.createdAt)) : 'Unknown time'}
            </p>
          </div>
        </div>

        {/* Post Title */}
        <h3 className="text-lg font-bold mb-2">{post.title}</h3>
        
        {/* Post Preview Content - limiting to 120 characters */}
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
            <span className="badge badge-primary mr-1">
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

export default PostCard; 