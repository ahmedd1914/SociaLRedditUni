import React, { useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import DataTable from "../components/DataTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllComments, fetchActiveComments } from "../api/ApiCollection";
import {
  HiOutlineGlobeAmericas,
  HiOutlineLockClosed,
  HiPlus,
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";
import { Visibility } from "../api/interfaces";
import AddData from "../components/AddData";

interface CommentsProps {
  showActiveOnly?: boolean;
}

const Comments: React.FC<CommentsProps> = ({ showActiveOnly: initialActiveOnly = false }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(initialActiveOnly);

  const { isLoading, isSuccess, data } = useQuery({
    queryKey: ["comments", showActiveOnly],
    queryFn: async () => {
      const response = showActiveOnly ? await fetchActiveComments() : await fetchAllComments();
      // Transform the response to use consistent field name
      const transformedData = response.map(comment => ({
        ...comment,
        isDeleted: comment.isDeleted // Map 'deleted' to 'isDeleted'
      }));
      console.log('Transformed Response:', transformedData);
      return transformedData;
    },
  });

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
      field: "isDeleted",
      headerName: "Status",
      minWidth: 120,
      flex: 1,
      renderCell: (params) => {
        // Check for both 'isDeleted' and 'deleted' fields
        const isDeleted = params.row.isDeleted || params.row.deleted;
        
        return (
          <div className={`px-2 py-1 rounded-full text-sm ${
            isDeleted
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          }`}>
            {isDeleted ? "NOT ACTIVE" : "Active"}
          </div>
        );
      },
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

          <div className="flex items-center gap-3">
            {/* Filter Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className={`btn ${
                  showActiveOnly ? "btn-primary" : "btn-ghost"
                } flex items-center gap-2`}
                title={showActiveOnly ? "Showing active comments" : "Showing all comments"}
              >
                <HiOutlineAdjustmentsHorizontal className="text-lg" />
                {showActiveOnly ? "Active Only" : "All Comments"}
              </button>
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
            includeActionColumn={true} // This enables the built-in actions
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
