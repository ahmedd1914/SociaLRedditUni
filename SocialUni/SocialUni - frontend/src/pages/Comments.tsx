import React, { useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import DataTable from "../components/DataTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchAllComments, deleteComment } from "../api/ApiCollection";
import {
  HiOutlineGlobeAmericas,
  HiOutlineLockClosed,
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineTrash,
  HiPlus,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { CommentResponseDto, Visibility } from "../api/interfaces";
import AddData from "../components/AddData";

const Comments = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isLoading, isError, isSuccess, data } = useQuery({
    queryKey: ["allcomments"],
    queryFn: fetchAllComments,
  });

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmed) return;

    try {
      await deleteComment(id);
      toast.success("Comment deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["allcomments"] });
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", minWidth: 90 },
    {
      field: "content",
      headerName: "Content",
      minWidth: 500,
      flex: 1,
      renderCell: (params) => (
        <div className="flex flex-col items-start gap-0">
          <p className="text-[14px] line-clamp-2">{params.row.content}</p>
          {params.row.mediaUrl && (
            <a
              href={params.row.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              View Media
            </a>
          )}
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
      field: "visibility",
      headerName: "Visibility",
      minWidth: 120,
      flex: 1,
      renderCell: (params) =>
        params.row.visibility === Visibility.PUBLIC ? (
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
      field: "createdAt",
      headerName: "Created At",
      minWidth: 120,
    },
    {
      field: "reactionCount",
      headerName: "Likes",
      minWidth: 80,
      type: "number",
    },
    {
      field: "postId",
      headerName: "Post ID",
      minWidth: 100,
      type: "number",
    },
    {
      field: "parentCommentId",
      headerName: "Parent Comment",
      minWidth: 120,
      renderCell: (params) => (
        <div>
          {params.row.parentCommentId ? params.row.parentCommentId : "N/A"}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 180,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          {/* View Comment */}
          <button
            onClick={() => navigate(`/comments/${params.row.id}`)}
            className="btn btn-square btn-ghost"
          >
            <HiOutlineEye />
          </button>

          {/* Edit Comment */}
          <button
            onClick={() => navigate(`/comments/${params.row.id}/edit`)}
            className="btn btn-square btn-ghost"
          >
            <HiOutlinePencilSquare />
          </button>

          {/* Delete Comment */}
          <button
            onClick={() => handleDelete(params.row.id)}
            className="btn btn-square btn-ghost text-red-500 hover:bg-red-100"
          >
            <HiOutlineTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full p-0 m-0">
      <div className="w-full flex flex-col items-stretch gap-3">
        <div className="w-full flex justify-between mb-5">
          <div className="flex flex-col">
            <h2 className="font-bold text-2xl xl:text-4xl text-base-content dark:text-neutral-200">
              Comments
            </h2>
            {data && data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {data.length} Comments Found
              </span>
            )}
          </div>

          {/* Create Comment Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <HiPlus className="text-lg" />
            Create Comment
          </button>
        </div>

        {isLoading ? (
          <DataTable
            slug="comments"
            columns={columns}
            rows={[]}
            includeActionColumn={false}
          />
        ) : isSuccess ? (
          <DataTable
            slug="comments"
            columns={columns}
            rows={data}
            includeActionColumn={false}
          />
        ) : (
          <>
            <DataTable
              slug="comments"
              columns={columns}
              rows={[]}
              includeActionColumn={false}
            />
            <div className="w-full flex justify-center">
              Error while fetching comments!
            </div>
          </>
        )}
      </div>

      {/* Create Comment Modal */}
      {isModalOpen && (
        <AddData
          slug="comment"
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default Comments;
