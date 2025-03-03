import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineXMark } from 'react-icons/hi2';
import { useQueryClient } from '@tanstack/react-query';
import { CreatePostDto, CreateGroupDto, CreateEventDto, CreateCommentDto, CreateUserDto, Visibility, Category, EventPrivacy } from '../api/interfaces';
// Import your API functions for each type:
import { createUser, createPost, createGroup, createEvent, createComment } from '../api/ApiCollection';

interface AddDataProps {
  slug: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddData: React.FC<AddDataProps> = ({ slug, isOpen, setIsOpen }) => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(isOpen);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // For "user"
  const [userForm, setUserForm] = useState<CreateUserDto>({
    fname: '',
    lname: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    // add role if needed, default to "USER"
  });

  // For "post"
  const [postForm, setPostForm] = useState<CreatePostDto>({
    title: '',
    content: '',
    category: Category.GENERAL,
    visibility: Visibility.PUBLIC,
    groupId: undefined, // optional
  });

  // For "group"
  const [groupForm, setGroupForm] = useState<CreateGroupDto>({
    name: '',
    description: '',
    visibility: Visibility.PUBLIC,
    category: Category.GENERAL,
    // add other fields as needed
  });

  // For "event"
  const [eventForm, setEventForm] = useState<CreateEventDto>({
    name: '',
    description: '',
    date: '',
    location: '',
    groupId: undefined,
    category: Category.GENERAL,
    privacy: EventPrivacy.PUBLIC,
  });

  const [commentForm, setCommentForm] = useState<CreateCommentDto>({
    content: '',         // NotBlank
    mediaUrl: '',
    postId: 0,
    parentCommentId: null, // Set to null for top-level comments
    visibility: Visibility.PUBLIC,  // default = PUBLIC in backend
  });
  
  const loadImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUpload = e.target.files[0];
      setFile(imageUpload);
      setPreview(URL.createObjectURL(imageUpload));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitting new data for slug:', slug);
    try {
      switch (slug) {
        case 'user':
          console.log('User Form:', userForm);
          await createUser(userForm);
          toast.success('User created successfully!');
          queryClient.invalidateQueries({ queryKey: ['allusers'] });
          break;
        case 'post':
          console.log('Post Form:', postForm);
          await createPost(postForm);
          toast.success('Post created successfully!');
          queryClient.invalidateQueries({ queryKey: ['allposts'] });
          break;
        case 'group':
          console.log('Group Form:', groupForm);
          await createGroup(groupForm);
          toast.success('Group created successfully!');
          queryClient.invalidateQueries({ queryKey: ['allgroups'] });
          break;
        case 'event':
          console.log('Event Form:', eventForm);
          await createEvent(eventForm);
          toast.success('Event created successfully!');
          queryClient.invalidateQueries({ queryKey: ['allevents'] });
          break;
        case 'comment':
          console.log('Comment Form:', commentForm);
          await createComment(commentForm);
          toast.success('Comment created successfully!');
          queryClient.invalidateQueries({ queryKey: ['allcomments'] });
          break;
        default:
          throw new Error('Invalid slug');
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error while creating data:', error);
      toast.error('Failed to create data');
    }
  };

  // Update showModal when isOpen changes
  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  // Render form based on slug
  const renderForm = () => {
    switch (slug) {
      case 'user':
        return (
          <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              value={userForm.fname}
              onChange={(e) => setUserForm({ ...userForm, fname: e.target.value })}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={userForm.lname}
              onChange={(e) => setUserForm({ ...userForm, lname: e.target.value })}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              className="input input-bordered w-full"
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              placeholder="Phone Number"
              name="phoneNumber"
              value={userForm.phoneNumber}
              onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
              className="input input-bordered w-full"
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              className="input input-bordered w-full"
            />
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Pick a profile photo</span>
              </div>
              <input
                type="file"
                className="file-input file-input-bordered w-full"
                onChange={loadImage}
              />
            </label>
            {preview && (
              <div className="w-full flex flex-col items-start gap-3">
                <span>Profile Preview</span>
                <div className="avatar">
                  <div className="w-24 rounded-full">
                    <img src={preview} alt="profile-preview" />
                  </div>
                </div>
              </div>
            )}
            <button className="mt-5 btn btn-primary btn-block font-semibold" disabled={userForm.fname === '' || userForm.lname === '' || userForm.email === '' || userForm.username === '' || userForm.password === ''}>
              Submit
            </button>
          </form>
        );
      case 'post':
        return (
          <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Title"
              name="title"
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              className="input input-bordered w-full"
            />
            <textarea
              placeholder="Content"
              name="content"
              value={postForm.content}
              onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              className="textarea textarea-bordered w-full"
            />
            {/* Category Dropdown */}
            <select
              name="categoryId"
              value={postForm.category}
              onChange={(e) => setPostForm({ ...postForm, category: e.target.value as Category })}
              className="select select-bordered w-full"
            >
              {Object.entries(Category).map(([key, value]) => (
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </select>
            {/* Visibility Dropdown */}
            <select
              name="visibility"
              value={postForm.visibility}
              onChange={(e) => setPostForm({ ...postForm, visibility: e.target.value as Visibility })}
              className="select select-bordered w-full"
            >
              <option value={Visibility.PUBLIC}>Public</option>
              <option value={Visibility.PRIVATE}>Private</option>
            </select>
            {/* Group ID (optional) */}
            <input
              type="number"
              placeholder="Group ID (optional)"
              name="groupId"
              value={postForm.groupId ?? ''} // show blank if undefined
              onChange={(e) => {
                const val = e.target.value;
                // if blank, set groupId to undefined
                setPostForm({
                  ...postForm,
                  groupId: val === '' ? undefined : parseInt(val, 10),
                });
              }}
              className="input input-bordered w-full"
            />
            <button className="mt-5 btn btn-primary btn-block font-semibold" disabled={postForm.title === '' || postForm.content === ''}>
              Submit
            </button>
          </form>
        );
      case 'group':
        return (
          <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Group Name"
              name="name"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              className="input input-bordered w-full"
            />
            <textarea
              placeholder="Description"
              name="description"
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              className="textarea textarea-bordered w-full"
            />
            {/* Category Dropdown */}
            <select
              name="categoryId"
              value={groupForm.category}
              onChange={(e) => setGroupForm({ ...groupForm, category: e.target.value as Category })}
              className="select select-bordered w-full"
            >
              {Object.entries(Category).map(([key, value]) => (
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </select>
            {/* Visibility Dropdown */}
            <select
              name="visibility"
              value={groupForm.visibility}
              onChange={(e) => setGroupForm({ ...groupForm, visibility: e.target.value as Visibility })}
              className="select select-bordered w-full"
            >
              <option value={Visibility.PUBLIC}>Public</option>
              <option value={Visibility.PRIVATE}>Private</option>
            </select>
            <button className="mt-5 btn btn-primary btn-block font-semibold" disabled={groupForm.name === '' || groupForm.description === ''}>
              Submit
            </button>
          </form>
        );
      case 'event':
        return (
          <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Event Title"
              name="title"
              value={eventForm.name}
              onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
              className="input input-bordered w-full"
            />
            <textarea
              placeholder="Event Description"
              name="description"
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="textarea textarea-bordered w-full"
            />
            <input
              type="datetime-local"
              name="date"
              value={eventForm.date}
              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              placeholder="Location"
              name="location"
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
              className="input input-bordered w-full"
            />
            <button className="mt-5 btn btn-primary btn-block font-semibold" disabled={eventForm.name === '' || eventForm.description === '' || eventForm.date === '' || eventForm.location === ''}>
              Submit
            </button>
          </form>
        );
      case 'comment':
        return (
          <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 gap-4">
            <textarea
              placeholder="Comment"
              name="content"
              value={commentForm.content}
              onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
              className="textarea textarea-bordered w-full"
            />
            <input
              type="number"
              placeholder="Post ID"
              name="postId"
              value={commentForm.postId}
              onChange={(e) => setCommentForm({ ...commentForm, postId: Number(e.target.value) })}
              className="input input-bordered w-full"
            />
            <button className="mt-5 btn btn-primary btn-block font-semibold" disabled={commentForm.content === '' || commentForm.postId === 0}>
              Submit
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    isOpen && (
      <div className="w-screen h-screen fixed top-0 left-0 flex justify-center items-center bg-black/75 z-[99]">
        <div
          className={`w-[80%] xl:w-[50%] rounded-lg p-7 bg-base-100 relative transition duration-300 flex flex-col items-stretch gap-5 overflow-y-auto max-h-full ${
            showModal ? 'translate-y-0' : 'translate-y-full'
          } ${showModal ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="w-full flex justify-between pb-5 border-b border-base-content border-opacity-30">
            <button
              onClick={() => {
                setShowModal(false);
                setIsOpen(false);
              }}
              className="absolute top-5 right-3 btn btn-ghost btn-circle"
            >
              <HiOutlineXMark className="text-xl font-bold" />
            </button>
            <span className="text-2xl font-bold">Add new {slug}</span>
          </div>
          {renderForm()}
        </div>
      </div>
    )
  );
};

export default AddData;