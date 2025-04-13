import React, { useState } from 'react';
import { CommentResponseDto } from '../../../api/interfaces';
import { toast } from 'react-hot-toast';
import { HiOutlineSearch } from 'react-icons/hi';
import { FaChevronDown, FaChevronUp, FaReply } from 'react-icons/fa';
import CommentReactionButton from './CommentReactionButton';
import SortControls from './SortControls';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

interface PostCommentsProps {
  postId: number;
  isAuthenticated: boolean;
  comments: CommentResponseDto[];
}

type SortOption = 'top' | 'new' | 'best' | 'old';

const PostComments: React.FC<PostCommentsProps> = ({
  postId,
  isAuthenticated,
  comments: initialComments
}) => {
  const [comments, setComments] = useState(initialComments);
  const [sortBy, setSortBy] = useState<SortOption>('top');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddComment, setShowAddComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    let sortedComments = [...comments];
    
    switch (option) {
      case 'new':
        sortedComments.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'old':
        sortedComments.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'best':
        sortedComments.sort((a, b) => {
          const aRatio = a.reactionCount ? a.reactionCount / (a.reactionCount * 2) : 0;
          const bRatio = b.reactionCount ? b.reactionCount / (b.reactionCount * 2) : 0;
          return bRatio - aRatio;
        });
        break;
      case 'top':
      default:
        sortedComments.sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0));
        break;
    }
    
    setComments(sortedComments);
  };

  const toggleReplies = (commentId: number) => {
    setExpandedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleReply = (commentId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to reply to comments');
      return;
    }
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyContent('');
  };

  const submitReply = async (commentId: number) => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    
    try {
      // TODO: Implement reply submission
      toast.success('Reply added successfully');
      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddComment = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add comments');
      return;
    }
    setShowAddComment(true);
  };

  const renderComment = (comment: CommentResponseDto, isReply = false) => (
    <div key={comment.id} className={`bg-base-200 rounded-lg p-4 ${isReply ? 'ml-8 mt-4' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{comment.username}</span>
            <span className="text-sm text-base-content/60">•</span>
            <span className="text-sm text-base-content/60">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-base-content/80 mb-4">{comment.content}</p>
          <div className="flex items-center gap-4">
            <CommentReactionButton
              commentId={comment.id}
              initialReaction={comment.userReaction}
              reactionCount={comment.reactionCount || 0}
              isAuthenticated={isAuthenticated}
              onReactionChange={() => {
                // Refresh comments if needed
              }}
            />
            <button
              className="btn btn-ghost btn-sm gap-2 hover:text-primary"
              onClick={() => handleReply(comment.id)}
            >
              <FaReply className="w-4 h-4" />
              Reply
            </button>
            {comment.replies && comment.replies.length > 0 && (
              <button
                className="btn btn-ghost btn-sm gap-2"
                onClick={() => toggleReplies(comment.id)}
              >
                {expandedComments.includes(comment.id) ? (
                  <>
                    <FaChevronUp className="w-4 h-4" />
                    Hide Replies
                  </>
                ) : (
                  <>
                    <FaChevronDown className="w-4 h-4" />
                    Show Replies ({comment.replies.length})
                  </>
                )}
              </button>
            )}
          </div>
          
          {replyingTo === comment.id && (
            <div className="mt-4 pl-8">
              <textarea
                className="textarea textarea-bordered w-full h-20"
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!replyContent.trim()}
                  onClick={() => submitReply(comment.id)}
                >
                  Post Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {expandedComments.includes(comment.id) && comment.replies && (
        <div className="space-y-4 mt-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
        <button
          className="btn btn-primary"
          onClick={handleAddComment}
        >
          Add Comment
        </button>
      </div>

      {showAddComment && isAuthenticated && (
        <div className="mb-6">
          <textarea
            className="textarea textarea-bordered w-full h-24"
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setShowAddComment(false);
                setNewComment('');
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!newComment.trim()}
              onClick={() => {
                // TODO: Implement comment submission
                toast.success('Comment added successfully');
                setShowAddComment(false);
                setNewComment('');
              }}
            >
              Post Comment
            </button>
          </div>
        </div>
      )}

      <SortControls
        sortBy={sortBy}
        onSortChange={handleSort}
        searchTerm={searchTerm}
        onSearchChange={(term) => setSearchTerm(term)}
      />

      <div className="space-y-4">
        {filteredComments.length > 0 ? (
          filteredComments.map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No comments match your search.' : 'No comments yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostComments; 