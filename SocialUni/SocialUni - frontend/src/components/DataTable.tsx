import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineTrash,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { deleteUser } from '../api/ApiCollection'; // Ensure this function exists

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

  // Handle user deletion
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await deleteUser(id); // API call to delete user
      toast.success('User deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete user');
      console.error(error);
    }
  };

  const actionColumn: GridColDef = {
    field: 'action',
    headerName: 'Action',
    minWidth: 200,
    flex: 1,
    renderCell: (params) => (
      <div className="flex items-center gap-2">
        {/* View User */}
        <button
          onClick={() => navigate(`/${slug}/${params.row.id}`)}
          className="btn btn-square btn-ghost"
        >
          <HiOutlineEye />
        </button>

        {/* Edit User */}
        <button
          onClick={() => navigate(`/${slug}/${params.row.id}/edit`)}
          className="btn btn-square btn-ghost"
        >
          <HiOutlinePencilSquare />
        </button>

        {/* Delete User */}
        <button
          onClick={() => handleDelete(params.row.id)}
          className="btn btn-square btn-ghost text-red-500 hover:bg-red-100"
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
        getRowHeight={() => 'auto'}
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
