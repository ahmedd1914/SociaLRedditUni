import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { API } from '../../api/api';
import PostCard from './post/PostCard';
import CreatePostButton from './post/CreatePostButton';
import { useAuth } from '../../contexts/AuthContext';
import { TrendingCarousel, PostSorting, getFilteredAndSortedPosts } from './trending';

const HomeFeed = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSort, setActiveSort] = useState(searchParams.get('sort') || 'hot');
  const [timeFilter, setTimeFilter] = useState(searchParams.get('time') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Fetch all posts
  const allPostsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: API.fetchAllPosts,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch trending posts for the carousel - separate from filtered posts
  const trendingPostsQuery = useQuery({
    queryKey: ['trending-posts'],
    queryFn: () => API.fetchTrendingPosts(),
    retry: 2,
    retryDelay: 1000,
  });

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setActiveSort(sort);
  };

  // Handle time filter change
  const handleTimeFilterChange = (timeFilter: string) => {
    setTimeFilter(timeFilter);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setCategory(category);
  };

  // Handle search term change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Update URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', activeSort);
    newParams.set('time', timeFilter);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  }, [activeSort, timeFilter, category, searchTerm, setSearchParams, searchParams]);

  if (allPostsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (allPostsQuery.isError) {
    const error = allPostsQuery.error as Error;
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold">Error loading posts</h3>
          <div className="text-xs">{error.message || "Please try again later."}</div>
          <button 
            className="btn btn-sm mt-2" 
            onClick={() => allPostsQuery.refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Apply filtering and sorting only to regular posts, not trending posts
  const filteredPosts = getFilteredAndSortedPosts(
    allPostsQuery.data || [], 
    activeSort, 
    timeFilter
  );

  return (
    <div className="space-y-6">
      {/* Trending Posts Carousel - separate from filtered posts */}
      <TrendingCarousel 
        posts={trendingPostsQuery.data}
        isLoading={trendingPostsQuery.isLoading}
        isError={trendingPostsQuery.isError}
      />

      {/* Sort and Filter Controls - only affect regular posts */}
      <div className="flex justify-between items-center">
        <PostSorting 
          onSortChange={handleSortChange}
          onTimeFilterChange={handleTimeFilterChange}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
        />
        
        {isAuthenticated && <CreatePostButton />}
      </div>

      {/* Regular Posts List - with filtering and sorting applied */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts found. Try changing your filters or create a new post.</p>
        </div>
      )}
    </div>
  );
};

export default HomeFeed; 