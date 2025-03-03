import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../components/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchAllGroups, createGroup, deleteGroup } from '../api/ApiCollection';
import {
  HiOutlineGlobeAmericas,
  HiOutlineLockClosed,
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineTrash,
  HiPlus,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { CreateGroupDto, GroupResponseDto, Visibility, Category } from '../api/interfaces';
import AddData from '../components/AddData';

const Groups = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isLoading, isError, isSuccess, data } = useQuery({
    queryKey: ['allgroups'],
    queryFn: fetchAllGroups,
  });

  const createGroupMutation = useMutation<GroupResponseDto, Error, CreateGroupDto>({
    mutationFn: createGroup,
    onSuccess: () => {
      toast.success('Group created successfully!');
      queryClient.invalidateQueries({ queryKey: ['allgroups'] });
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error('Failed to create group');
    },
  });

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this group?");
    if (!confirmed) return;

    try {
      await deleteGroup(id, 1); // Assuming 1 is the adminId, replace with actual adminId
      toast.success('Group deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['allgroups'] });
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  const handleCreateGroup = (newGroup: CreateGroupDto) => {
    createGroupMutation.mutate(newGroup);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', minWidth: 90 },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 300,
      flex: 1,
    },
    {
      field: 'description',
      headerName: 'Description',
      minWidth: 500,
      flex: 1,
    },
    {
      field: 'category',
      headerName: 'Category',
      minWidth: 150,
      flex: 1,
    },
    {
      field: 'visibility',
      headerName: 'Visibility',
      minWidth: 120,
      flex: 1,
      renderCell: (params) =>
        params.row.visibility === 'PUBLIC' ? (
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
      field: 'memberCount',
      headerName: 'Members',
      minWidth: 100,
      type: 'number',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 180,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          {/* View Group */}
          <button
            onClick={() => navigate(`/groups/${params.row.id}`)}
            className="btn btn-square btn-ghost"
          >
            <HiOutlineEye />
          </button>

          {/* Edit Group */}
          <button
            onClick={() => navigate(`/groups/${params.row.id}/edit`)}
            className="btn btn-square btn-ghost"
          >
            <HiOutlinePencilSquare />
          </button>

          {/* Delete Group */}
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
              Groups
            </h2>
            {data && data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {data.length} Groups Found
              </span>
            )}
          </div>

          {/* Create Group Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <HiPlus className="text-lg" />
            Create Group
          </button>
        </div>

        {isLoading ? (
          <DataTable slug="groups" columns={columns} rows={[]} includeActionColumn={false} />
        ) : isSuccess ? (
          <DataTable slug="groups" columns={columns} rows={data} includeActionColumn={false} />
        ) : (
          <>
            <DataTable slug="groups" columns={columns} rows={[]} includeActionColumn={false} />
            <div className="w-full flex justify-center">
              Error while fetching groups!
            </div>
          </>
        )}
      </div>

      {/* Create Group Modal */}
      {isModalOpen && (
        <AddData slug="group" isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      )}
    </div>
  );
};

export default Groups;