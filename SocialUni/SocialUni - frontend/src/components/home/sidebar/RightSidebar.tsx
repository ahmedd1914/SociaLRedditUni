import React, { useEffect, useState } from 'react';
import { API } from '../../../api/api';
import { GroupResponseDto } from '../../../api/interfaces';
import { HiUserGroup } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const RightSidebar = () => {
  const [trendingGroups, setTrendingGroups] = useState<GroupResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingGroups = async () => {
      try {
        const groups = await API.fetchAllGroups();
        // Sort groups by member count in descending order
        const sortedGroups = groups
          .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
          .slice(0, 5); // Show top 5 groups
        setTrendingGroups(sortedGroups);
      } catch (error) {
        console.error('Error fetching trending groups:', error);
        toast.error('Failed to load trending groups');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingGroups();
  }, []);

  return (
    <div className="bg-base-200 rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4">Trending Groups</h3>
      {isLoading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : trendingGroups.length > 0 ? (
        <div className="space-y-3">
          {trendingGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-2 p-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <HiUserGroup className="text-primary w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{group.name}</h4>
                <p className="text-sm text-gray-500">{group.memberCount} members</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No trending groups found</p>
      )}
    </div>
  );
};

export default RightSidebar;