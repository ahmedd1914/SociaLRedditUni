import React, { useState } from 'react';
import { CommentResponseDto } from '../../../api/interfaces';
import { toast } from 'react-hot-toast';
import { HiOutlineSearch } from 'react-icons/hi';
import CommentComponent from './CommentComponent';

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

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    let sortedComments = [...comments];
    
    switch (option) {
      case 'top':
        sortedComments.sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0));
        break;
      case 'new':
        sortedComments.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        break;
      case 'old':
        sortedComments.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        break;
      case 'best':
        // Sort by ratio of positive reactions to total reactions
        sortedComments.sort((a, b) => {
          const aRatio = a.reactionCount ? a.positiveReactions / a.reactionCount : 0;
          const bRatio = b.reactionCount ? b.positiveReactions / b.reactionCount : 0;
          return bRatio - aRatio;
        });
        break;
    }
    
    setComments(sortedComments);
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

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="join">
            <button
              className={`join-item btn btn-sm ${sortBy === 'top' ? 'btn-active' : ''}`}
              onClick={() => handleSort('top')}
            >
              Top
            </button>
            <button
              className={`join-item btn btn-sm ${sortBy === 'new' ? 'btn-active' : ''}`}
              onClick={() => handleSort('new')}
            >
              New
            </button>
            <button
              className={`join-item btn btn-sm ${sortBy === 'best' ? 'btn-active' : ''}`}
              onClick={() => handleSort('best')}
            >
              Best
            </button>
            <button
              className={`join-item btn btn-sm ${sortBy === 'old' ? 'btn-active' : ''}`}
              onClick={() => handleSort('old')}
            >
              Old
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search comments..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <CommentComponent
              key={comment.id}
              comment={comment}
              isAuthenticated={isAuthenticated}
            />
          ))
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