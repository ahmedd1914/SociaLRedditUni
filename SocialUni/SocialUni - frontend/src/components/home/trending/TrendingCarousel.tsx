import React, { useState } from 'react';
import { PostResponseDto } from '../../../api/interfaces';
import { useQuery } from '@tanstack/react-query';
import { API } from '../../../api/api';
import { FaArrowLeft, FaArrowRight, FaFire, FaComments, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

interface TrendingCarouselProps {
  posts?: PostResponseDto[];
  isLoading?: boolean;
  isError?: boolean;
}

export const TrendingCarousel: React.FC<TrendingCarouselProps> = ({
  posts: initialPosts,
  isLoading: initialLoading,
  isError: initialError,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data: fetchedPosts, isLoading, isError } = useQuery({
    queryKey: ['trendingPosts'],
    queryFn: () => API.fetchTrendingPosts(),
    enabled: !initialPosts && !initialLoading && !initialError,
  });

  // Ensure we only show a maximum of 5 posts
  const posts = (initialPosts || fetchedPosts || []).slice(0, 5);
  const loading = initialLoading || isLoading;
  const error = initialError || isError;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === posts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? posts.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading trending posts...</div>
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">No trending posts available</div>
      </div>
    );
  }

  const currentPost = posts[currentIndex];

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
        >
          <FaArrowRight className="text-gray-600" />
        </button>

        {/* Post Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FaFire className="text-orange-500" />
              <span className="text-sm font-medium text-gray-500">
                Trending Now
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(currentPost.createdAt), { addSuffix: true })}
            </span>
          </div>

          <Link to={`/post/${currentPost.id}`} className="block">
            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
              {currentPost.title}
            </h3>
          </Link>

          <p className="text-gray-600 mb-4 line-clamp-2">{currentPost.content}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FaHeart className="text-red-500" />
                <span className="text-sm text-gray-600">{currentPost.reactionCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaComments className="text-blue-500" />
                <span className="text-sm text-gray-600">{currentPost.comments?.length || 0}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={`/profile/${currentPost.username}`}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Posted by {currentPost.username}
              </Link>
              {currentPost.category && (
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {currentPost.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2 pb-4">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 