import React, { useState, useCallback } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineTrash,
  HiArrowLeft,
  HiOutlineXMark,
  HiOutlineGlobeAmericas,
  HiOutlineLockClosed,
  HiOutlineUserGroup,
  HiOutlineHeart,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog } from "@mui/material";
import { API } from "../api/api";

interface DataTableProps {
  columns: GridColDef[];
  rows: any[];
  slug: string;
  includeActionColumn: boolean;
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  slug,
  includeActionColumn,
  onEdit,
  onView,
  onDelete,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Remove "admin/" prefix for non‑user endpoints.
  const cleanSlug = slug.replace("admin/", "");

  // Query to fetch detail data when a row is selected.
  const { data: detailData, isLoading: isDetailLoading, isError: isDetailError, error } = useQuery({
    queryKey: [cleanSlug, selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      switch (cleanSlug) {
        case "users":
          return await API.fetchUserById(selectedId);
        case "posts":
          return await API.fetchPostById(selectedId);
        case "groups":
          return await API.fetchGroupById(selectedId);
        case "comments":
          return await API.fetchCommentById(selectedId);
        case "events":
          return await API.fetchEventById(selectedId);
        default:
          return null;
      }
    },
    enabled: !!selectedId,
  });

  const handleViewDetails = useCallback(
    (row: any) => {
      // For users, navigate directly; for others, open the dialog.
      if (cleanSlug === "users") {
        const isAdminRoute = window.location.pathname.includes("/admin/");
        const basePath = isAdminRoute ? "/admin" : "";
        navigate(`${basePath}/${cleanSlug}/${row.id}`);
      } else {
        setSelectedId(row.id);
        setIsDialogOpen(true);
      }
    },
    [cleanSlug, navigate]
  );

  // Helper to format values with special handling for different types
  const formatValue = (value: any, key: string): React.ReactNode => {
    if (value === null || value === undefined) return "—";
    
    // Handle dates
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
      return new Date(value).toLocaleString();
    }

    // Handle visibility
    if (key === 'visibility') {
      const getVisibilityConfig = (type: string) => {
        switch (type) {
          case "PUBLIC":
            return {
              icon: <HiOutlineGlobeAmericas className="text-lg" />,
              color: "text-green-500",
              bgColor: "bg-green-100",
              label: "Public"
            };
          case "PRIVATE":
            return {
              icon: <HiOutlineLockClosed className="text-lg" />,
              color: "text-red-500",
              bgColor: "bg-red-100",
              label: "Private"
            };
          case "FRIENDS_ONLY":
            return {
              icon: <HiOutlineUserGroup className="text-lg" />,
              color: "text-blue-500",
              bgColor: "bg-blue-100",
              label: "Friends Only"
            };
          default:
            return {
              icon: <HiOutlineGlobeAmericas className="text-lg" />,
              color: "text-gray-500",
              bgColor: "bg-gray-100",
              label: type
            };
        }
      };

      const config = getVisibilityConfig(value);
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} ${config.color}`}>
          {config.icon}
          <span className="font-medium">{config.label}</span>
        </div>
      );
    }

    // Handle reaction types
    if (key === 'reactionTypes') {
      if (Object.keys(value).length === 0) return "No reactions";
      return (
        <div className="flex flex-wrap gap-2">
          {Object.entries(value).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2 px-3 py-1 bg-base-200 rounded-full">
              <span className="font-medium">{type}</span>
              <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {String(count)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Handle comments
    if (key === 'comments') {
      const renderComment = (comment: any) => {
        const getVisibilityConfig = (type: string) => {
          switch (type) {
            case "PUBLIC":
              return {
                icon: <HiOutlineGlobeAmericas className="text-lg text-green-500" />,
              };
            case "PRIVATE":
              return {
                icon: <HiOutlineLockClosed className="text-lg text-red-500" />,
              };
            case "FRIENDS_ONLY":
              return {
                icon: <HiOutlineUserGroup className="text-lg text-blue-500" />,
              };
            default:
              return {
                icon: <HiOutlineGlobeAmericas className="text-lg text-gray-500" />,
              };
          }
        };

        return (
          <div key={comment.id} className="bg-base-200 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.username}</span>
                <span className="text-sm text-base-content/60">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              {getVisibilityConfig(comment.visibility).icon}
            </div>
            <p className="text-base-content">{comment.content}</p>
            {comment.mediaUrl && (
              <div className="mt-2">
                <img src={comment.mediaUrl} alt="Comment media" className="max-w-xs rounded-lg" />
              </div>
            )}
            {comment.reactionCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <HiOutlineHeart className="text-red-500" />
                <span>{comment.reactionCount} reactions</span>
              </div>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-4 space-y-3 mt-3 border-l-2 border-base-300 pl-4">
                {comment.replies.map(renderComment)}
              </div>
            )}
          </div>
        );
      };

      if (!Array.isArray(value) || value.length === 0) return "No comments";
      return (
        <div className="space-y-4">
          {value.map(renderComment)}
        </div>
      );
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return "No items";
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span key={index} className="px-2 py-1 bg-base-200 rounded-md text-sm">
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </span>
          ))}
        </div>
      );
    }

    // Handle objects
    if (typeof value === 'object') {
      return (
        <pre className="whitespace-pre-wrap break-words text-sm bg-base-200 p-2 rounded">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return (
        <span className={`px-2 py-1 rounded-full text-sm ${value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    return String(value);
  };

  // Render detail content in a friendly layout
  const renderDetailContent = () => {
    if (isDetailLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (isDetailError || !detailData) {
      return (
        <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg">
          <p className="font-medium">Error loading details</p>
          <p className="text-sm mt-1">{error?.message || 'Unknown error occurred'}</p>
        </div>
      );
    }

    // Group fields by category
    const groupedFields = Object.entries(detailData).reduce((acc, [key, value]) => {
      if (key === 'id') return acc;
      
      const category = key.toLowerCase().includes('date') ? 'Timeline' :
                      key.toLowerCase().includes('user') ? 'User Information' :
                      key.toLowerCase().includes('content') ? 'Content' :
                      key.toLowerCase().includes('settings') ? 'Settings' :
                      'Details';
      
      if (!acc[category]) acc[category] = [];
      acc[category].push([key, value]);
      return acc;
    }, {} as Record<string, [string, any][]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedFields).map(([category, fields]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold text-base-content/80 border-b border-base-200 pb-2">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(([key, value]) => {
                const label = key.charAt(0).toUpperCase() + 
                            key.slice(1).replace(/([A-Z])/g, ' $1');
          return (
                  <div key={key} className="bg-base-100 p-4 rounded-lg shadow-sm">
                    <label className="text-sm font-medium text-base-content/60 block mb-2">
                {label}
              </label>
                    <div className="text-base-content">
                      {formatValue(value, key)}
                    </div>
            </div>
          );
        })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleDelete = async (id: number) => {
    const entityName = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
    
    try {
      if (onDelete) {
        await onDelete(id);
      } else {
      switch (cleanSlug) {
        case "users":
            await API.deleteUser(id);
          break;
        case "posts":
          await API.deletePost(id);
          break;
        case "comments":
            // Get comment details first
            const comment = await API.fetchCommentById(id);
            if (comment.isDeleted) {
              const confirmed = window.confirm(
                "This comment is already inactive. Do you want to permanently delete it from the database? This action cannot be undone."
              );
              if (confirmed) {
                await API.permanentlyDeleteComment(id);
                toast.success("Comment permanently deleted from database!");
              } else {
                toast.success("Permanent deletion cancelled");
              }
            } else {
              const confirmed = window.confirm(
                "Are you sure you want to delete this comment? It will be marked as inactive."
              );
              if (confirmed) {
          await API.deleteComment(id);
                toast.success("Comment marked as inactive!");
              } else {
                toast.success("Deletion cancelled");
              }
            }
          break;
        case "groups":
          await API.deleteGroup(id);
          break;
        case "events":
          await API.deleteEvent(id);
          break;
        default:
          throw new Error("Invalid entity type");
      }
      queryClient.invalidateQueries({ queryKey: [`all${cleanSlug}`] });
      }
    } catch (error) {
      console.error(`Error deleting ${cleanSlug}:`, error);
      toast.error(`Failed to delete ${cleanSlug}`);
    }
  };

  const actionColumn: GridColDef = {
    field: "action",
    headerName: "Action",
    minWidth: 200,
    flex: 1,
    renderCell: (params) => {
      const isAdminRoute = window.location.pathname.includes("/admin/");
      const basePath = isAdminRoute ? "/admin" : "";
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onView) {
                onView(params.row.id);
              } else {
              handleViewDetails(params.row);
              }
            }}
            className="btn btn-square btn-ghost"
            title={`View ${cleanSlug} details`}
          >
            <HiOutlineEye />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) {
                onEdit(params.row.id);
              } else {
              navigate(`${basePath}/${cleanSlug}/${params.row.id}/edit`);
              }
            }}
            className="btn btn-square btn-ghost"
            title={`Edit ${cleanSlug}`}
          >
            <HiOutlinePencilSquare />
          </button>
          {isAdminRoute && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(params.row.id);
              }}
              className="btn btn-square btn-ghost text-red-500 hover:bg-red-100"
              title={`Delete ${cleanSlug}`}
            >
              <HiOutlineTrash />
            </button>
          )}
        </div>
      );
    },
  };

  const gridColumns = includeActionColumn ? [...columns, actionColumn] : columns;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header with back button */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="btn btn-ghost gap-2">
          <HiArrowLeft className="text-xl" /> Back
        </button>
        <h2 className="text-2xl font-bold capitalize">{cleanSlug}</h2>
      </div>

      {/* DataGrid */}
      <div className="w-full bg-base-100 text-base-content">
        <DataGrid
          className="dataGrid p-0 xl:p-3 w-full bg-base-100 text-white"
          rows={rows}
          columns={gridColumns}
          getRowHeight={() => "auto"}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          disableColumnFilter
          disableDensitySelector
          disableColumnSelector
        />
      </div>

      {/* Details Dialog (for non‑user entities) */}
      {cleanSlug !== "users" && (
        <Dialog
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedId(null);
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            className: "bg-base-100 rounded-lg shadow-xl",
          }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-base-200 pb-4">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold capitalize text-base-content">
                  {cleanSlug.slice(0, -1)} Details
                </h2>
                <span className="text-sm text-base-content/60">
                  ID: {selectedId}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedId(null);
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <HiOutlineXMark className="text-xl" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              {renderDetailContent()}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default DataTable;
