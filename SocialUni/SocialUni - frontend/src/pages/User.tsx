import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '../api/ApiCollection';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Example static data for the chart – adjust as needed.
const dataLine = [
  { name: 'Jan', purchased: 4000, wishlisted: 2400 },
  { name: 'Feb', purchased: 3000, wishlisted: 1398 },
  { name: 'Mar', purchased: 2000, wishlisted: 9800 },
  { name: 'Apr', purchased: 2780, wishlisted: 3908 },
  { name: 'May', purchased: 1890, wishlisted: 4800 },
  { name: 'Jun', purchased: 2390, wishlisted: 3800 },
  { name: 'Jul', purchased: 3490, wishlisted: 4300 },
];

const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    isLoading,
    isError,
    data,
    isSuccess,
  } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const users = await fetchUserById(Number(id));
      return users[0]; // Assuming fetchUserById returns an array of users
    },
  });

  // Show toast messages on state changes (optional)
  useEffect(() => {
    if (isLoading) {
      toast.loading('Loading user...', { id: 'userToast' });
    }
    if (isError) {
      toast.error('Error loading user data!', { id: 'userToast' });
    }
    if (isSuccess) {
      toast.success('User data loaded!', { id: 'userToast' });
    }
  }, [isLoading, isError, isSuccess]);

  return (
    <div id="singleUser" className="w-full p-0 m-0">
      <div className="w-full grid xl:grid-cols-2 gap-10 mt-5 xl:mt-0">
        {/* Column 1: User Profile & Details */}
        <div className="w-full flex flex-col items-start gap-10">
          {/* Profile Block */}
          <div className="w-full flex flex-col items-start gap-5">
            <div className="w-full flex items-center gap-3">
              <div className="flex items-center gap-3 xl:gap-8 xl:mb-4">
                <div className="avatar">
                  {isLoading ? (
                    <div className="w-24 xl:w-36 h-24 xl:h-36 rounded-full skeleton dark:bg-neutral"></div>
                  ) : isSuccess && data ? (
                    <div className="w-24 xl:w-36 rounded-full">
                      {/* If you have an image field, use it; otherwise use a placeholder */}
                      <img src={data.img || '/default-avatar.png'} alt="avatar" />
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col items-start gap-1">
                  {isLoading ? (
                    <div className="w-[200px] h-[36px] skeleton dark:bg-neutral"></div>
                  ) : isSuccess && data ? (
                    <h3 className="font-semibold text-xl xl:text-3xl dark:text-white">
                      {data.username}
                    </h3>
                  ) : (
                    <div className="w-[200px] h-[36px] skeleton dark:bg-neutral"></div>
                  )}
                  <span className="font-normal text-base">Member</span>
                </div>
              </div>
            </div>
            {/* Detail Block */}
            <div className="w-full flex gap-8">
              {isLoading ? (
                <div className="w-full xl:w-[50%] h-52 skeleton dark:bg-neutral"></div>
              ) : isSuccess && data ? (
                <div className="w-full grid grid-cols-3 xl:flex gap-5 xl:gap-8">
                  {/* Column 1: Labels */}
                  <div className="col-span-1 flex flex-col items-start gap-3 xl:gap-5">
                    <span>Username</span>
                    <span>Email</span>
                    <span>Status</span>
                    <span>Last Login</span>
                  </div>
                  {/* Column 2: Values */}
                  <div className="col-span-2 flex flex-col items-start gap-3 xl:gap-5">
                    <span className="font-semibold">{data.username}</span>
                    <span className="font-semibold">{data.email}</span>
                    <span className="font-semibold">
                      {data.enabled ? 'Active' : 'Inactive'}
                    </span>
                    <span className="font-semibold">
                      {data.lastLogin ? new Date(data.lastLogin).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full xl:w-[50%] h-52 skeleton dark:bg-neutral"></div>
              )}
            </div>
          </div>
          {/* Divider */}
          <div className="w-full h-[2px] bg-base-300 dark:bg-slate-700"></div>
          {/* Chart Block */}
          {isLoading ? (
            <div className="w-full min-h-[300px] skeleton dark:bg-neutral"></div>
          ) : isSuccess ? (
            <div className="w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataLine}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="purchased" stroke="#8884d8" />
                  <Line type="monotone" dataKey="wishlisted" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full min-h-[300px] skeleton dark:bg-neutral"></div>
          )}
        </div>
        {/* Column 2: Latest Activities */}
        <div id="activities" className="w-full flex flex-col items-start gap-5">
          <h2 className="text-2xl font-semibold dark:text-white">Latest Activities</h2>
          {isLoading &&
            [1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="w-full h-20 skeleton dark:bg-neutral"></div>
            ))}
          {isSuccess && data && (
            <ul>
              <li>
                <div className="ml-[1px] relative p-4 bg-base-200 dark:bg-neutral dark:text-neutral-50 min-w-[85vw] xl:min-w-[480px] flex flex-col items-start gap-3">
                  <span>{data.username} postet</span>
                  <span className="text-xs">3 days ago</span>
                </div>
              </li>
              <li>
                <div className="ml-[1px] relative p-4 bg-base-200 dark:bg-neutral dark:text-neutral-50 min-w-[85vw] xl:min-w-[480px] flex flex-col items-start gap-3">
                  <span>{data.username} updated profile settings</span>
                  <span className="text-xs">1 week ago</span>
                </div>
              </li>
              {/* Additional activities can be listed here */}
            </ul>
          )}
          {isError &&
            [1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="w-full h-20 skeleton dark:bg-neutral"></div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default User;
