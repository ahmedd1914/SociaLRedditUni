import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../components/DataTable';
import { fetchAllUsers } from '../api/ApiCollection';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AddData from '../components/AddData';

const Users = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const defaultAvatar = '/Portrait_Placeholder.png';
  
  const { isLoading, isError, isSuccess, data } = useQuery({
    queryKey: ['allusers'],
    queryFn: fetchAllUsers,
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'username',
      headerName: 'Name',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => {
        const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.src = defaultAvatar;
        };
        
        return (
          <div className="flex gap-3 items-center">
            <div className="avatar">
              <div className="w-6 xl:w-9 rounded-full">
                <img
                  src={params.row.imgUrl || defaultAvatar}
                  alt={params.row.username || "User"}
                  onError={handleImageError}
                />
              </div>
            </div>
            <span className="mb-0 pb-0 leading-none">
              {params.row.username}
            </span>
          </div>
        );
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone',
      width: 130,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
    },
    {
      field: 'enabled',
      headerName: 'Active',
      type: 'boolean',
      width: 100,
      renderCell: (params) => (params.row.enabled ? 'Yes' : 'No'),
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      minWidth: 100,
      flex: 0.5,
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      minWidth: 100,
      flex: 0.5,
    },
  ];

  React.useEffect(() => {
    if (isLoading) {
      toast.loading('Loading...', { id: 'promiseUsers' });
    }
    if (isError) {
      toast.error('Error while getting the data!', { id: 'promiseUsers' });
    }
    if (isSuccess) {
      toast.success('Got the data successfully!', { id: 'promiseUsers' });
    }
  }, [isError, isLoading, isSuccess]);

  return (
    <div className="w-full p-0 m-0">
      <div className="w-full flex flex-col items-stretch gap-3">
        <div className="w-full flex justify-between mb-5">
          <div className="flex gap-1 justify-start flex-col items-start">
            <h2 className="font-bold text-2xl xl:text-4xl mt-0 pt-0 text-base-content dark:text-neutral-200">
              Users
            </h2>
            {data && data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {data.length} Users Found
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className={`btn ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
          >
            Add New User +
          </button>
        </div>
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <DataTable slug="users" columns={columns} rows={[]} includeActionColumn={true} />
          ) : isSuccess ? (
            <DataTable slug="users" columns={columns} rows={data} includeActionColumn={true} />
          ) : (
            <>
              <DataTable slug="users" columns={columns} rows={[]} includeActionColumn={true} />
              <div className="w-full flex justify-center">
                Error while getting the data!
              </div>
            </>
          )}
        </div>
        {isOpen && (
          <AddData slug="user" isOpen={isOpen} setIsOpen={setIsOpen} />
        )}
      </div>
    </div>
  );
};

export default Users;
