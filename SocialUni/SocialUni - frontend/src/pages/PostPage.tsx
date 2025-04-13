import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../api/api';
import { PostResponseDto, UsersDto, ReactionResponseDto } from '../api/interfaces';
import { toast } from 'react-hot-toast';
import LeftSidebar from '../components/home/sidebar/LeftSidebar';
import MainPostComponent from '../components/home/post/MainPostComponent';
import PostComments from '../components/home/post/PostComments';
import RightSidePostBar from '../components/home/post/RightSidePostBar';

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState<PostResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UsersDto | null>(null);
  const [userReaction, setUserReaction] = useState<ReactionResponseDto | null>(null);
  const [reactionCount, setReactionCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const postData = isAuthenticated 
          ? await API.fetchPostById(parseInt(id))
          : await API.fetchPublicPostById(parseInt(id));
        
        if (!postData) {
          throw new Error('Post not found');
        }
        
        setPost(postData);
        setReactionCount(postData.reactionCount || 0);
        
        if (isAuthenticated) {
          try {
            const user = await API.fetchUserProfileByUsername(postData.username);
            setUserProfile(user);
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
          
          try {
            const reaction = await API.getUserReaction(parseInt(id));
            setUserReaction(reaction);
          } catch (error) {
            console.error('Error fetching user reaction:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        let errorMessage = 'Failed to load post.';
        
        if (error instanceof Error) {
          if (error.message.includes('not publicly accessible')) {
            errorMessage = 'This post is private. Please log in to view it.';
          } else if (error.message.includes('not found')) {
            errorMessage = 'This post does not exist or has been deleted.';
          }
        }
        
        toast.error(errorMessage);
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-base-200">
        <div className="w-64 hidden lg:block p-4 bg-base-100">
          <LeftSidebar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen bg-base-200">
        <div className="w-64 hidden lg:block p-4 bg-base-100">
          <LeftSidebar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="alert alert-error">
            <span>Post not found</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base-200">
      <div className="w-100 hidden lg:block p-4 bg-base-100">
        <LeftSidebar />
      </div>
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto flex gap-8">
          <div className="w-2 hidden lg:block" />
          <div className="flex-1 max-w-9x2">
            <MainPostComponent
              post={post}
              userProfile={userProfile}
              userReaction={userReaction}
              reactionCount={reactionCount}
              setUserReaction={setUserReaction}
              setReactionCount={setReactionCount}
              isAuthenticated={isAuthenticated}
            />
            <PostComments
              postId={post.id}
              isAuthenticated={isAuthenticated}
              comments={post.comments || []}
            />
          </div>
          <div className="w-80 hidden lg:block">
            {post.groupId && <RightSidePostBar groupId={post.groupId} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage; 