import { PostResponseDto } from '../../../api/interfaces';
import { SORT_OPTIONS, TIME_FILTERS } from './PostSorting';

/**
 * Filter posts based on time filter
 */
export const filterPostsByTime = (posts: PostResponseDto[], timeFilter: string): PostResponseDto[] => {
  if (!posts || timeFilter === 'all') return posts;
  
  const now = new Date();
  const filterDate = new Date();
  
  switch (timeFilter) {
    case 'day':
      filterDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      filterDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      filterDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      filterDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return posts.filter(post => new Date(post.createdAt) >= filterDate);
};

/**
 * Sort posts based on sort option
 */
export const sortPosts = (posts: PostResponseDto[], sortOption: string): PostResponseDto[] => {
  if (!posts) return [];
  
  const sortedPosts = [...posts];
  
  switch (sortOption) {
    case 'hot':
      return sortedPosts.sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0));
    case 'best':
      return sortedPosts.sort((a, b) => {
        const aScore = (a.reactionCount || 0) / (new Date().getTime() - new Date(a.createdAt).getTime());
        const bScore = (b.reactionCount || 0) / (new Date().getTime() - new Date(b.createdAt).getTime());
        return bScore - aScore;
      });
    case 'new':
      return sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'top':
      return sortedPosts.sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0));
    case 'rising':
      return sortedPosts.sort((a, b) => {
        const aAge = (new Date().getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
        const bAge = (new Date().getTime() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
        const aScore = (a.reactionCount || 0) / Math.max(1, aAge);
        const bScore = (b.reactionCount || 0) / Math.max(1, bAge);
        return bScore - aScore;
      });
    default:
      return sortedPosts;
  }
};

/**
 * Get similar posts based on title
 */
export const getSimilarPosts = (post: PostResponseDto, allPosts: PostResponseDto[]): PostResponseDto[] => {
  if (!allPosts || !post) return [];
  
  const titleWords = post.title.toLowerCase().split(' ');
  return allPosts
    .filter(p => p.id !== post.id)
    .map(p => {
      const pTitleWords = p.title.toLowerCase().split(' ');
      const commonWords = titleWords.filter((word: string) => pTitleWords.includes(word));
      return { ...p, similarity: commonWords.length };
    })
    .filter(p => p.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);
};

/**
 * Get filtered and sorted posts
 */
export const getFilteredAndSortedPosts = (
  posts: PostResponseDto[], 
  sortOption: string, 
  timeFilter: string
): PostResponseDto[] => {
  if (!posts) return [];
  
  // First filter by time
  const timeFilteredPosts = filterPostsByTime(posts, timeFilter);
  
  // Then sort
  return sortPosts(timeFilteredPosts, sortOption);
}; 