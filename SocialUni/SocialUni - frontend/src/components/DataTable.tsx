import React, { useState, useCallback } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineTrash,
  HiArrowLeft,
  HiOutlineXMark,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog } from "@mui/material";
import {
  fetchUserById,
  fetchPostById,
  fetchGroupById,
  fetchCommentById,
  fetchEventById,
  deleteUser,
  deletePost,
  deleteComment,
  deleteGroup,
  deleteEvent,
} from "../api/ApiCollection";

interface DataTableProps {
  columns: GridColDef[];
  rows: any[];
  slug: string;
  includeActionColumn: boolean;
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  slug,
  includeActionColumn,
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
          return await fetchUserById(selectedId);
        case "posts":
          return await fetchPostById(selectedId);
        case "groups":
          return await fetchGroupById(selectedId);
        case "comments":
          return await fetchCommentById(selectedId);
        case "events":
          return await fetchEventById(selectedId);
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

  // Helper to format values (only display primitive values)
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return "";
    return String(value);
  };

  // Render detail content in a friendly layout.
  const renderDetailContent = () => {
    if (isDetailLoading) {
      return <div className="text-center p-4">Loading details...</div>;
    }
    if (isDetailError || !detailData) {
      return (
        <div className="text-center p-4 text-red-500">
          Error loading details.
        </div>
      );
    }

    // Filter out keys with object values and the "id" field.
    const entries = Object.entries(detailData).filter(([key, value]) => {
      return key !== "id" && (typeof value !== "object" || value === null);
    });

    return (
      <div className="grid grid-cols-2 gap-4">
        {entries.map(([key, value]) => {
          const label =
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1");
          return (
            <div key={key} className="col-span-2 sm:col-span-1 bg-base-100 p-3 rounded">
              <label className="text-sm font-medium text-gray-500 block mb-1">
                {label}
              </label>
              <p className="text-gray-800 font-medium whitespace-pre-wrap break-words">
                {formatValue(value)}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const handleDelete = async (id: number) => {
    const entityName = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${cleanSlug}?`
    );
    if (!confirmed) return;
    try {
      switch (cleanSlug) {
        case "users":
          await deleteUser(id);
          break;
        case "posts":
          await deletePost(id);
          break;
        case "comments":
          await deleteComment(id);
          break;
        case "groups":
          await deleteGroup(id);
          break;
        case "events":
          await deleteEvent(id);
          break;
        default:
          throw new Error("Invalid entity type");
      }
      toast.success(`${entityName} deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: [`all${cleanSlug}`] });
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
              handleViewDetails(params.row);
            }}
            className="btn btn-square btn-ghost"
            title={`View ${cleanSlug} details`}
          >
            <HiOutlineEye />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${basePath}/${cleanSlug}/${params.row.id}/edit`);
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
