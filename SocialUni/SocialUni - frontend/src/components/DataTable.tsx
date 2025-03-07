import React from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineTrash,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import {
  deleteUser,
  deletePost,
  deleteComment,
  deleteGroup,
  deleteEvent,
} from "../api/ApiCollection";
import { useQueryClient } from "@tanstack/react-query";

interface DataTableProps {
  columns: GridColDef[];
  rows: object[];
  slug: string;
  includeActionColumn: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  slug,
  includeActionColumn,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDelete = async (id: number) => {
    const entityName = slug.charAt(0).toUpperCase() + slug.slice(1);
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${slug}?`
    );
    if (!confirmed) return;

    try {
      switch (slug) {
        case "users":
          await deleteUser(id);
          break;
        case "posts":
          await deletePost(id);
          break;
        case "comments":
          await deleteComment(id, 1); // Assuming adminId is 1, replace with actual admin ID
          break;
        case "groups":
          await deleteGroup(id, 1); // Assuming userId is 1, replace with actual user ID
          break;
        case "events":
          await deleteEvent(id);
          break;
        default:
          throw new Error("Invalid entity type");
      }

      toast.success(`${entityName} deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: [`all${slug}`] });
    } catch (error) {
      console.error(`Error deleting ${slug}:`, error);
      toast.error(`Failed to delete ${slug}`);
    }
  };

  const actionColumn: GridColDef = {
    field: "action",
    headerName: "Action",
    minWidth: 200,
    flex: 1,
    renderCell: (params) => (
      <div className="flex items-center gap-2">
        {/* View Details */}
        <button
          onClick={() => navigate(`/admin/${slug}/${params.row.id}`)}
          className="btn btn-square btn-ghost"
          title={`View ${slug} details`}
        >
          <HiOutlineEye />
        </button>

        {/* Edit */}
        <button
          onClick={() => navigate(`/admin/${slug}/${params.row.id}/edit`)}
          className="btn btn-square btn-ghost"
          title={`Edit ${slug}`}
        >
          <HiOutlinePencilSquare />
        </button>

        {/* Delete */}
        <button
          onClick={() => handleDelete(params.row.id)}
          className="btn btn-square btn-ghost text-red-500 hover:bg-red-100"
          title={`Delete ${slug}`}
        >
          <HiOutlineTrash />
        </button>
      </div>
    ),
  };

  return (
    <div className="w-full bg-base-100 text-base-content">
      <DataGrid
        className="dataGrid p-0 xl:p-3 w-full bg-base-100 text-white"
        rows={rows}
        columns={includeActionColumn ? [...columns, actionColumn] : columns}
        getRowHeight={() => "auto"}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
        disableColumnFilter
        disableDensitySelector
        disableColumnSelector
      />
    </div>
  );
};

export default DataTable;
