import { useEffect, useState } from "react";
import PostService, { Post } from "../services/PostService.tsx";

const NewsFeed = ({ userId }: { userId: number }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        PostService.getUserFeed(userId)
            .then((response) => {
                setPosts(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching posts:", error);
                setLoading(false);
            });
    }, [userId]);

    return (
        <div>
            <h2>News Feed</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                posts.map((post) => (
                    <div key={post.id} className="post-card">
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                        <span>Posted in Group {post.groupId}</span>
                    </div>
                ))
            )}
        </div>
    );
};

export default NewsFeed;
