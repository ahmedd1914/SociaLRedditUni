import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCreateOutline } from 'react-icons/io5';

const CreatePostButton = () => {
  const navigate = useNavigate();

  return (
    <button
      className="btn btn-primary"
      onClick={() => navigate('/posts/create')}
    >
      <IoCreateOutline className="w-5 h-5 mr-2" />
      Create Post
    </button>
  );
};

export default CreatePostButton; 