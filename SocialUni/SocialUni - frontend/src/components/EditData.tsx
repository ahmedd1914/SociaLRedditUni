import React, { useState, FormEvent, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HiOutlineXMark } from "react-icons/hi2";
import { API } from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Category,
  Visibility,
  UpdateUserDto,
  UpdatePostDto,
  UpdateEventDto,
  CreateGroupDto,
  UpdateCommentDto,
  CommentResponseDto,
  PostResponseDto,
  GroupResponseDto,
  EventResponseDto,
  UsersDto,
  EventPrivacy,
  EventStatus,
} from "../api/interfaces";

interface EditDataProps {
  slug: string;
  onClose?: () => void;
  id?: string;
}

// Type guards
const isUserResponse = (data: unknown): data is UsersDto => {
  return typeof data === "object" && data !== null && "id" in data;
};

const isPostResponse = (data: unknown): data is PostResponseDto => {
  return typeof data === "object" && data !== null && "title" in data;
};

const isGroupResponse = (data: unknown): data is GroupResponseDto => {
  return typeof data === "object" && data !== null && "name" in data;
};

const isCommentResponse = (data: unknown): data is CommentResponseDto => {
  return typeof data === "object" && data !== null && "content" in data;
};

const isEventResponse = (data: unknown): data is EventResponseDto => {
  return (
    typeof data === "object" && 
    data !== null && 
    "name" in data && 
    "status" in data &&
    "date" in data
  );
};

const EditData: React.FC<EditDataProps> = ({ slug, onClose, id: propId }) => {
  const { id: routeId } = useParams<{ id: string }>();
  const id = propId || routeId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const cleanSlug = slug.replace("admin/", "");
  const validSlugs = ["users", "posts", "groups", "comments", "events"];

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error("You need admin privileges to access this page");
      navigate('/');
    }
  }, [user, navigate]);

  // Form states
  const [userForm, setUserForm] = useState<UpdateUserDto>({
    fname: "",
    lname: "",
    username: "",
    email: "",
    phoneNumber: "",
    imgUrl: "",
    role: "",
    enabled: false,
  });

  const [postForm, setPostForm] = useState<UpdatePostDto>({
    title: "",
    content: "",
    category: Category.GENERAL,
    visibility: Visibility.PUBLIC,
    groupId: undefined,
  });

  const [groupForm, setGroupForm] = useState<GroupResponseDto>({
    id: 0,
    name: "",
    description: "",
    visibility: Visibility.PUBLIC,
    category: Category.GENERAL,
    memberCount: 0,
    ownerId: 0,
    adminIds: [],
    memberIds: []
  });

  const [commentForm, setCommentForm] = useState<UpdateCommentDto>({
    content: "",
    mediaUrl: "",
    visibility: Visibility.PUBLIC,
  });

  const [eventForm, setEventForm] = useState<UpdateEventDto>({
    name: "",
    description: "",
    date: "",
    location: "",
    category: Category.GENERAL,
    privacy: EventPrivacy.PUBLIC,
    status: EventStatus.SCHEDULED,
    groupId: undefined
  });

  // Data fetching
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [cleanSlug, id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      if (!user || user.role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin privileges required");
      }
      console.log(`Fetching ${cleanSlug} with ID:`, id);

      try {
        switch (cleanSlug) {
          case "users":
            return await API.fetchUserById(Number(id));
          case "posts":
            return await API.fetchPostById(Number(id));
          case "groups":
            return await API.fetchGroupById(Number(id));
          case "comments":
            return await API.fetchCommentById(Number(id));
          case "events":
            return await API.fetchEventById(Number(id));
          default:
            throw new Error(`Invalid entity type: ${cleanSlug}`);
        }
      } catch (err) {
        console.error(`Error fetching ${cleanSlug}:`, err);
        throw err;
      }
    },
    enabled: Boolean(id) && validSlugs.includes(cleanSlug) && !!user && user.role === 'ADMIN',
  });

  // Update form when data is loaded
  useEffect(() => {
    if (!data) return;
    console.log(`Setting ${cleanSlug} form data:`, data);

    try {
      switch (cleanSlug) {
        case "users":
          if (isUserResponse(data)) {
            setUserForm({
              fname: data.fname,
              lname: data.lname,
              username: data.username,
              email: data.email,
              phoneNumber: data.phoneNumber || "",
              imgUrl: data.imgUrl || "",
              role: data.role,
              enabled: data.enabled,
            });
          }
          break;
        case "posts":
          if (isPostResponse(data)) {
            setPostForm({
              title: data.title,
              content: data.content,
              category: data.category,
              visibility: data.visibility,
              groupId: data.groupId,
            });
          }
          break;
        case "groups":
          if (isGroupResponse(data)) {
            setGroupForm({
              id: data.id,
              name: data.name,
              description: data.description || "",
              visibility: data.visibility,
              category: data.category,
              memberCount: data.memberCount,
              ownerId: data.ownerId,
              adminIds: data.adminIds,
              memberIds: data.memberIds
            });
          }
          break;
        case "comments":
          if (isCommentResponse(data)) {
            setCommentForm({
              content: data.content,
              mediaUrl: data.mediaUrl || "",
              visibility: data.visibility,
            });
          }
          break;
        case "events":
          if (isEventResponse(data)) {
            setEventForm({
              name: data.name,
              description: data.description,
              date: data.date,
              location: data.location,
              category: data.category,
              privacy: data.privacy,
              status: data.status,
              groupId: data.groupId ?? undefined
            });
          }
          break;
      }
    } catch (err) {
      console.error(`Error setting ${cleanSlug} form:`, err);
    }
  }, [data, cleanSlug]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No ID provided");

      const isAdminRoute = slug.startsWith("admin/");
      switch (cleanSlug) {
        case "users":
          return await API.updateUserProfile(Number(id), userForm);
        case "posts":
          return await API.updatePost(Number(id), postForm);
        case "groups":
          // Convert GroupResponseDto to CreateGroupDto
          const groupDto: CreateGroupDto = {
            name: groupForm.name,
            description: groupForm.description,
            visibility: groupForm.visibility,
            category: groupForm.category
          };
          return await API.updateGroup(Number(id), groupDto);
        case "comments":
          console.log("Updating comment with data:", commentForm);
          return await API.updateComment(Number(id), commentForm);
        case "events":
          return await API.updateEvent(Number(id), eventForm);
        default:
          throw new Error(`Invalid entity type: ${cleanSlug}`);
      }
    },
    onSuccess: () => {
      toast.success(`${cleanSlug} updated successfully!`);
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: [cleanSlug, id] });
      queryClient.invalidateQueries({ queryKey: [`all${cleanSlug}`] });
      queryClient.invalidateQueries({ queryKey: ["allevents"] });
      queryClient.invalidateQueries({ queryKey: ["allposts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });

      // Close modal if onClose is provided, otherwise navigate
      if (onClose) {
        onClose();
      } else {
        const isAdminRoute = slug.startsWith("admin/");
        const basePath = isAdminRoute ? `/admin/${cleanSlug}` : `/${cleanSlug}`;
        navigate(basePath);
      }
    },
    onError: (error: Error) => {
      console.error(`Error updating ${cleanSlug}:`, error);
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="alert alert-error">
          <div>
            <h3 className="font-bold">Error</h3>
            <div className="text-sm">
              {error instanceof Error ? error.message : "Failed to load data"}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="btn btn-sm btn-outline mt-4"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderForm = () => {
    // Remove admin/ prefix from slug for form rendering
    const cleanSlug = slug.replace("admin/", "");
    console.log("Rendering form for:", { originalSlug: slug, cleanSlug });

    switch (cleanSlug) {
      case "users":
        return (
          <form
            onSubmit={handleSubmit}
            className="w-full grid grid-cols-1 gap-4"
          >
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                placeholder="First Name"
                value={userForm.fname || ""}
                onChange={(e) =>
                  setUserForm({ ...userForm, fname: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                placeholder="Last Name"
                value={userForm.lname || ""}
                onChange={(e) =>
                  setUserForm({ ...userForm, lname: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="Username"
                value={userForm.username || ""}
                onChange={(e) =>
                  setUserForm({ ...userForm, username: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Email"
                value={userForm.email || ""}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="tel"
                placeholder="Phone Number"
                value={userForm.phoneNumber || ""}
                onChange={(e) =>
                  setUserForm({ ...userForm, phoneNumber: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={!userForm?.username || !userForm?.email}
            >
              Update User
            </button>
          </form>
        );
      case "posts":
        return (
          <form
            onSubmit={handleSubmit}
            className="w-full grid grid-cols-1 gap-4"
          >
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                placeholder="Title"
                value={postForm.title}
                onChange={(e) =>
                  setPostForm({ ...postForm, title: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Content</span>
              </label>
              <textarea
                placeholder="Content"
                value={postForm.content}
                onChange={(e) =>
                  setPostForm({ ...postForm, content: e.target.value })
                }
                className="textarea textarea-bordered w-full"
                rows={4}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select
                value={postForm.category}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    category: e.target.value as Category,
                  })
                }
                className="select select-bordered w-full"
              >
                {Object.values(Category).map((category, index) => (
                  <option key={index} value={index + 1}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Visibility</span>
              </label>
              <select
                value={postForm.visibility}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    visibility: e.target.value as Visibility,
                  })
                }
                className="select select-bordered w-full"
              >
                <option value={Visibility.PUBLIC}>Public</option>
                <option value={Visibility.PRIVATE}>Private</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={!postForm.title || !postForm.content}
            >
              Update Post
            </button>
          </form>
        );
      case "groups":
        return (
          <form
            onSubmit={handleSubmit}
            className="w-full grid grid-cols-1 gap-4"
          >
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Group Name</span>
              </label>
              <input
                type="text"
                placeholder="Group Name"
                value={groupForm.name}
                onChange={(e) =>
                  setGroupForm({ ...groupForm, name: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                placeholder="Description"
                value={groupForm.description}
                onChange={(e) =>
                  setGroupForm({ ...groupForm, description: e.target.value })
                }
                className="textarea textarea-bordered w-full"
                rows={4}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Category</span>
                <span className="label-text-alt">Select a category</span>
              </label>
              <select
                value={groupForm.category}
                onChange={(e) =>
                  setGroupForm({
                    ...groupForm,
                    category: e.target.value as Category,
                  })
                }
                className="select select-bordered w-full"
              >
                {Object.values(Category).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Visibility</span>
                <span className="label-text-alt">Who can see this group?</span>
              </label>
              <select
                value={groupForm.visibility}
                onChange={(e) =>
                  setGroupForm({
                    ...groupForm,
                    visibility: e.target.value as Visibility,
                  })
                }
                className="select select-bordered w-full"
              >
                <option value={Visibility.PUBLIC}>Public</option>
                <option value={Visibility.PRIVATE}>Private</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={!groupForm.name || !groupForm.description}
            >
              Update Group
            </button>
          </form>
        );
      case "comments":
        return (
          <form
            onSubmit={handleSubmit}
            className="w-full grid grid-cols-1 gap-4"
          >
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Content</span>
              </label>
              <textarea
                placeholder="Content"
                value={commentForm.content}
                onChange={(e) =>
                  setCommentForm({ ...commentForm, content: e.target.value })
                }
                className="textarea textarea-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Visibility</span>
                <span className="label-text-alt">Who can see this comment?</span>
              </label>
              <select
                value={commentForm.visibility}
                onChange={(e) =>
                  setCommentForm({
                    ...commentForm,
                    visibility: e.target.value as Visibility,
                  })
                }
                className="select select-bordered w-full"
              >
                <option value={Visibility.PUBLIC}>Public</option>
                <option value={Visibility.PRIVATE}>Private</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Media URL (optional)</span>
                <span className="label-text-alt">Link to any media attached to the comment</span>
              </label>
              <input
                type="text"
                placeholder="Enter media URL"
                value={commentForm.mediaUrl}
                onChange={(e) =>
                  setCommentForm({ ...commentForm, mediaUrl: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={!commentForm.content}
            >
              Update Comment
            </button>
          </form>
        );
      case "events":
        return (
          <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Event Name</span>
              </label>
              <input
                type="text"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="textarea textarea-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Date and Time</span>
              </label>
              <input
                type="datetime-local"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <input
                type="text"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select
                value={eventForm.category}
                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as Category })}
                className="select select-bordered w-full"
                required
              >
                {Object.values(Category).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Privacy</span>
              </label>
              <select
                value={eventForm.privacy}
                onChange={(e) => setEventForm({ ...eventForm, privacy: e.target.value as EventPrivacy })}
                className="select select-bordered w-full"
                required
              >
                {Object.values(EventPrivacy).map((priv) => (
                  <option key={priv} value={priv}>{priv}</option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                value={eventForm.status}
                onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as EventStatus })}
                className="select select-bordered w-full"
                required
              >
                {Object.values(EventStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Group ID (Optional)</span>
                <span className="label-text-alt">Leave empty if this is a public event</span>
              </label>
              <input
                type="number"
                placeholder="Enter group ID"
                value={eventForm.groupId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEventForm({
                    ...eventForm,
                    groupId: val === "" ? undefined : parseInt(val, 10),
                  });
                }}
                className="input input-bordered w-full"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary mt-4"
              disabled={!eventForm.name || !eventForm.date}
            >
              Update Event
            </button>
          </form>
        );
      default:
        console.error("Unsupported entity type:", { slug, cleanSlug });
        return (
          <div className="alert alert-error">
            <div>
              <h3 className="font-bold">Unsupported Entity Type</h3>
              <div className="text-sm">
                Cannot render form for type: {cleanSlug}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-sm btn-outline"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold capitalize">
          Edit {cleanSlug.slice(0, -1)}
        </h2>
        <button
          onClick={() => {
            const isAdminRoute = slug.startsWith("admin/");
            const basePath = isAdminRoute
              ? `/admin/${cleanSlug}`
              : `/${cleanSlug}`;
            navigate(basePath);
          }}
          className="btn btn-ghost btn-circle"
          title="Close"
        >
          <HiOutlineXMark className="text-xl" />
        </button>
      </div>
      <div className="card bg-base-200">
        <div className="card-body">{renderForm()}</div>
      </div>
    </div>
  );
};

export default EditData;
