import { useState, useEffect } from "react";
import { GridColDef } from "@mui/x-data-grid";
import DataTable from "../../components/DataTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../../api/api";
import {
  HiOutlineGlobeAmericas,
  HiOutlineLockClosed,
  HiPlus,
} from "react-icons/hi2";
import AddData from "../../components/AddData";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Posts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error("You need admin privileges to access this page");
      navigate('/');
    }
  }, [user, navigate]);

  const { isLoading, isSuccess, data, error } = useQuery({
    queryKey: ["allposts"],
    queryFn: () => API.fetchAllPosts(),
    enabled: !!user && user.role === 'ADMIN',
    retry: false,
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch posts");
      console.error("Error fetching posts:", error);
    }
  }, [error]);

  // Function to handle post deletion
  const handleDelete = async (postId: number) => {
    try {
      await API.deletePost(postId);
      toast.success("Post deleted successfully!");
      // Invalidate both admin and regular posts queries to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ["allposts"] });
      queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  // Function to handle post edit
  const handleEdit = async (postId: number) => {
    navigate(`/admin/posts/${postId}/edit`);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", minWidth: 90 },
    {
      field: "title",
      headerName: "Title",
      minWidth: 500,
      flex: 1,
      renderCell: (params) => (
        <div className="flex gap-3 items-center py-2">
          <div className="w-20 h-12 sm:w-24 sm:h-14 xl:w-32 xl:h-[72px] rounded overflow-hidden">
            <img
              src={params.row.image || "https://placehold.co/720x400"}
              alt="thumbnail"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col items-start gap-0">
            <span className="text-base font-medium dark:text-white">
              {params.row.title}
            </span>
            <p className="text-[14px] line-clamp-2 text-neutral-400">
              {params.row.content}
            </p>
          </div>
        </div>
      ),
    },
    {
      field: "categoryName",
      headerName: "Category",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        const category =
          params.row.category || params.row.categoryName || "Uncategorized";
        return (
          <div className="flex gap-1 items-center">
            <span className="text-base font-medium">{category}</span>
          </div>
        );
      },
    },
    {
      field: "visibility",
      headerName: "Visibility",
      minWidth: 120,
      flex: 1,
      renderCell: (params) =>
        params.row.visibility === "PUBLIC" ? (
          <div className="flex gap-1 items-center">
            <HiOutlineGlobeAmericas className="text-lg" />
            <span>{params.row.visibility}</span>
          </div>
        ) : (
          <div className="flex gap-1 items-center">
            <HiOutlineLockClosed className="text-lg" />
            <span>{params.row.visibility}</span>
          </div>
        ),
    },
    {
      field: "username",
      headerName: "Author",
      minWidth: 220,
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      minWidth: 120,
    },
    {
      field: "reactionCount",
      headerName: "Reactions",
      minWidth: 80,
      type: "number",
    },
    {
      field: "comments",
      headerName: "Comments",
      minWidth: 100,
      renderCell: (params) => (
        <div>{params.row.comments ? params.row.comments.length : 0}</div>
      ),
    },
    {
      field: "groupId",
      headerName: "Group ID",
      minWidth: 120,
      renderCell: (params) => (
        <div>{params.row.groupId ? params.row.groupId : "N/A"}</div>
      ),
    },
  ];

  return (
    <div className="w-full p-0 m-0">
      <div className="w-full flex flex-col items-stretch gap-3">
        <div className="w-full flex justify-between mb-5">
          <div className="flex flex-col">
            <h2 className="font-bold text-2xl xl:text-4xl text-base-content dark:text-neutral-200">
              Posts
            </h2>
            {data && data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {data.length} Posts Found
              </span>
            )}
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <HiPlus className="text-lg" />
            Create Post
          </button>
        </div>

        {isLoading ? (
          <DataTable
            slug="posts"
            columns={columns}
            rows={[]}
            includeActionColumn={false}
          />
        ) : isSuccess ? (
          <DataTable
            slug="posts"
            columns={columns}
            rows={data}
            includeActionColumn={true}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ) : (
          <>
            <DataTable
              slug="posts"
              columns={columns}
              rows={[]}
              includeActionColumn={false}
            />
            <div className="w-full flex justify-center">
              Error while fetching posts!
            </div>
          </>
        )}
      </div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <AddData 
          slug="post" 
          isOpen={isModalOpen} 
          setIsOpen={setIsModalOpen}
          onSuccess={() => {
            // Invalidate both admin and regular posts queries to ensure UI is updated
            queryClient.invalidateQueries({ queryKey: ["allposts"] });
            queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
          }}
        />
      )}
    </div>
  );
};

export default Posts;
