import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { API } from '../../../api/api';
import { PostResponseDto, GroupResponseDto } from '../../../api/interfaces';
import { Link } from 'react-router-dom';
import { FaFire, FaUsers, FaChartLine, FaInfoCircle, FaLock, FaGlobe } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

interface RightSidePostBarProps {
  groupId: number;
}

const RightSidePostBar: React.FC<RightSidePostBarProps> = ({ groupId }) => {
  // Fetch trending posts for the current group
  const { data: trendingPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['trending-posts', groupId],
    queryFn: () => API.fetchTrendingPosts(),
    select: (posts) => posts.filter(post => post.groupId === groupId).slice(0, 5),
  });

  // Fetch group information
  const { data: groupInfo, isLoading: isLoadingGroup, error: groupError } = useQuery({
    queryKey: ['group-info', groupId],
    queryFn: async () => {
      try {
        return await API.fetchGroupById(groupId);
      } catch (error) {
        // If it's a 403 error, return null to handle it gracefully
        if (error instanceof Error && error.message.includes('403')) {
          return null;
        }
        throw error;
      }
    },
  });

  // Fetch all groups to calculate rank
  const { data: allGroups } = useQuery({
    queryKey: ['all-groups'],
    queryFn: () => API.fetchAllGroups(),
  });

  // Calculate group rank based on member count
  const groupRank = allGroups ? allGroups.findIndex((group: GroupResponseDto) => group.id === groupId) + 1 : 0;

  if (isLoadingPosts || isLoadingGroup) {
    return (
      <div className="w-80 space-y-4">
        <div className="bg-white rounded-lg shadow p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 space-y-4">
      {/* Group Info Section */}
      {groupInfo ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <FaInfoCircle className="text-blue-500" />
            <h3 className="font-semibold text-gray-800">Group Information</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FaUsers className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Members</p>
                <p className="font-medium text-gray-900">{groupInfo.memberCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FaChartLine className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Rank by Members</p>
                <p className="font-medium text-gray-900">#{groupRank}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {groupInfo.visibility === 'PUBLIC' ? (
                <FaGlobe className="text-green-500" />
              ) : (
                <FaLock className="text-red-500" />
              )}
              <div>
                <p className="text-sm text-gray-600">Visibility</p>
                <p className="font-medium text-gray-900 capitalize">{groupInfo.visibility.toLowerCase()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-sm text-gray-900">{groupInfo.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                {groupInfo.category}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <FaLock className="text-red-500" />
            <h3 className="font-semibold text-gray-800">Private Group</h3>
          </div>
          <p className="text-sm text-gray-600">
            This group is private. You need to be a member to view its information.
          </p>
        </div>
      )}

      {/* Trending Posts Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <FaFire className="text-orange-500" />
          <h3 className="font-semibold text-gray-800">Trending in this Group</h3>
        </div>
        
        {trendingPosts && trendingPosts.length > 0 ? (
          <div className="space-y-3">
            {trendingPosts.map((post) => (
              <Link 
                key={post.id} 
                to={`/post/${post.id}`}
                className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <h4 className="font-medium text-gray-900 line-clamp-2">{post.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span>{post.reactionCount} reactions</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No trending posts yet</p>
        )}
      </div>
    </div>
  );
};

export default RightSidePostBar; 