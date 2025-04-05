import * as React from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { API } from '../../api/api';
import { PostResponseDto } from '../../api/interfaces';

const TopDealsBox: React.FC = () => {
    const { isLoading, isError, data, error } = useQuery<PostResponseDto[], Error>({
        queryKey: ['trendingPosts'],
        queryFn: () => API.fetchTrendingPosts(),
    });

    if (isLoading) {
        // Render a skeleton/loading state
        return (
            <div className="w-full p-4 flex flex-col gap-4">
                <span className="text-2xl font-bold">Trending Posts</span>
                {[1, 2, 3].map((_, index) => (
                    <div key={index} className="w-full h-16 bg-gray-200 animate-pulse rounded"></div>
                ))}
            </div>
        );
    }

    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    if (!data || data.length === 0) {
        return <div>No trending posts found.</div>;
    }

    return (
        <div className="w-full p-4 flex flex-col gap-4">
            <span className="text-2xl font-bold">Trending Posts</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.map((post: PostResponseDto) => (
                    <button
                        key={post.id}
                        onClick={() => toast(`Post: ${post.title}`, { icon: 'ℹ️' })}
                        className="flex flex-col items-start border p-4 rounded hover:shadow-lg"
                    >
                        <div className="w-full h-32 overflow-hidden rounded mb-2">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold">{post.title}</span>
                            <span className="text-xs text-gray-500">
                                {new Date(post.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TopDealsBox;