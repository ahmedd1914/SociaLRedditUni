import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { API } from '../api/api';
import { FaRegCommentAlt } from 'react-icons/fa';
import { BsBookmark, BsShare } from 'react-icons/bs';
import { useAuth } from '../contexts/AuthContext';
import { CreateCommentDto, Visibility } from '../api/interfaces';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert postId to number
  const postIdNum = postId ? parseInt(postId, 10) : 0;

  // Fetch post data
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', postIdNum],
    queryFn: () => API.fetchPostById(postIdNum),
    enabled: !!postIdNum && postIdNum > 0,
  });

  // Fetch groups for reference
  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: API.fetchAllGroups,
  });

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const commentDto: CreateCommentDto = {
        content: commentContent,
        postId: postIdNum,
        visibility: Visibility.PUBLIC,
      };

      await API.createComment(commentDto);
      toast.success('Comment added successfully');
      setCommentContent('');
      // Refetch post data to show the new comment
      // This will work if your backend returns updated comments with the post
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-base-100 rounded-xl shadow-md p-8 text-center">
        <h3 className="text-xl font-semibold text-error mb-2">Error loading post</h3>
        <p className="text-gray-500 mb-4">There was a problem loading this post.</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/home')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-base-100 rounded-xl shadow-md p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Post not found</h3>
        <p className="text-gray-500 mb-4">The post you're looking for doesn't exist or has been deleted.</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/home')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Find group name if post belongs to a group
  const groupName = post.groupId && groupsQuery.data
    ? groupsQuery.data.find(g => g.id === post.groupId)?.name
    : null;

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-10">
      {/* Post Container */}
      <div className="bg-base-100 rounded-xl shadow-md overflow-hidden mb-6">
        {/* Post Header with Author Info */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center">
            <div className="avatar mr-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                {post.username?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            <div>
              <p className="font-medium">{post.username || "Unknown User"}</p>
              <p className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()} · 
                {post.createdAt && new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · 
                {groupName ? ` in ${groupName}` : ' Public'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Post Content */}
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          <p className="text-base-content whitespace-pre-wrap mb-6">{post.content}</p>
          
          {/* Post Image if exists */}
          {post.image && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          {/* Post Categories/Tags */}
          {post.category && (
            <div className="mb-6">
              <span className="badge badge-primary mr-1">
                {post.category}
              </span>
            </div>
          )}
          
          {/* Post Stats & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-base-300">
            <div className="flex items-center space-x-6">
              <button className="flex items-center text-gray-500 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span>{post.reactionCount || 0} Likes</span>
              </button>
              <button className="flex items-center text-gray-500 hover:text-primary">
                <FaRegCommentAlt className="mr-1" />
                <span>{post.comments?.length || 0} Comments</span>
              </button>
            </div>
            <div className="flex space-x-4">
              <button className="text-gray-500 hover:text-primary">
                <BsBookmark className="text-lg" />
              </button>
              <button className="text-gray-500 hover:text-primary">
                <BsShare className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comment Form */}
      <div className="bg-base-100 rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add Comment</h3>
        <div className="flex gap-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          <div className="flex-1">
            <textarea 
              className="textarea textarea-bordered w-full min-h-[100px]" 
              placeholder="Write your comment here..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-3">
              <button 
                className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                onClick={handleSubmitComment}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments List */}
      <div className="bg-base-100 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Comments ({post.comments?.length || 0})</h3>
        
        {post.comments && post.comments.length > 0 ? (
          <div className="space-y-6">
            {post.comments.map((comment) => (
              <div key={comment.id} className="border-b border-base-300 pb-4 last:border-none last:pb-0 pl-2">
                <div className="flex gap-3">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm">
                      {comment.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline">
                      <p className="font-medium">{comment.username}</p>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{comment.content}</p>
                    <div className="flex mt-2 gap-4">
                      <button className="text-xs text-gray-500 hover:text-primary">Like</button>
                      <button className="text-xs text-gray-500 hover:text-primary">Reply</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail; 