import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/api';
import { PostResponseDto } from '../api/interfaces';
import { useAuth } from '../contexts/AuthContext';

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        const postData = await API.fetchPostById(parseInt(postId));
        setPost(postData);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="alert alert-error">
        <span>{error || 'Post not found'}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <div className="prose max-w-none">
          <p>{post.content}</p>
        </div>
      </div>
    </div>
  );
};

export default PostPage; 