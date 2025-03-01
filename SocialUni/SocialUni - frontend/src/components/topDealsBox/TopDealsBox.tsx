import React from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchPostMetrics } from '../../api/ApiCollection';
import { PostMetricsDto } from '../../api/interfaces'; // adjust path as needed

const TopMetricsBox: React.FC = () => {
    const { isLoading, isError, data, error } = useQuery<PostMetricsDto>({
        queryKey: ['postMetrics'],
        queryFn: fetchPostMetrics,
    });

    if (isLoading) {
        // Render a skeleton/loading state
        return (
            <div className="w-full p-4 flex flex-col gap-4">
                <span className="text-2xl font-bold">Post Metrics</span>
                {[1, 2, 3].map((_, index) => (
                    <div key={index} className="w-full h-16 bg-gray-200 animate-pulse rounded"></div>
                ))}
            </div>
        );
    }

    if (isError) {
        return <div>Error: {(error as Error).message}</div>;
    }

    if (!data) {
        return <div>No metrics data found.</div>;
    }

    return (
        <div className="w-full p-4 flex flex-col gap-4">
            <span className="text-2xl font-bold">Post Metrics</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Latest Post */}
                <button
                    onClick={() =>
                        toast(`Latest post: ${data.latestPost.title}`, { icon: 'ℹ️' })
                    }
                    className="flex flex-col items-start border p-4 rounded hover:shadow-lg"
                >
                    <div className="w-full h-32 overflow-hidden rounded mb-2">
                        <img
                            src={data.latestPost.image}
                            alt={data.latestPost.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">{data.latestPost.title}</span>
                        <span className="text-xs text-gray-500">
              {new Date(data.latestPost.createdAt).toLocaleString()}
            </span>
                    </div>
                    <span className="mt-2 text-sm font-semibold">Latest</span>
                </button>

                {/* Most Reacted Post */}
                <button
                    onClick={() =>
                        toast(`Most reacted: ${data.mostReactedPost.title}`, { icon: 'ℹ️' })
                    }
                    className="flex flex-col items-start border p-4 rounded hover:shadow-lg"
                >
                    <div className="w-full h-32 overflow-hidden rounded mb-2">
                        <img
                            src={data.mostReactedPost.image}
                            alt={data.mostReactedPost.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">{data.mostReactedPost.title}</span>
                        <span className="text-xs text-gray-500">
              Reactions: {data.mostReactedPost.reactionCount}
            </span>
                    </div>
                    <span className="mt-2 text-sm font-semibold">Most Reacted</span>
                </button>

                {/* Most Commented Post */}
                <button
                    onClick={() =>
                        toast(`Most commented: ${data.mostCommentedPost.title}`, { icon: 'ℹ️' })
                    }
                    className="flex flex-col items-start border p-4 rounded hover:shadow-lg"
                >
                    <div className="w-full h-32 overflow-hidden rounded mb-2">
                        <img
                            src={data.mostCommentedPost.image}
                            alt={data.mostCommentedPost.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">{data.mostCommentedPost.title}</span>
                        <span className="text-xs text-gray-500">
              Comments: {data.mostCommentedPost.commentCount}
            </span>
                    </div>
                    <span className="mt-2 text-sm font-semibold">Most Commented</span>
                </button>
            </div>
            <button
                className="mt-4 btn btn-primary"
                onClick={() => toast('More details coming soon!', { icon: 'ℹ️' })}
            >
                More Details
            </button>
        </div>
    );
};

export default TopMetricsBox;
