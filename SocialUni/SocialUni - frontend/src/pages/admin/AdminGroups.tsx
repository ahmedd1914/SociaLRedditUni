import React, { useState, useEffect } from "react";
import { GridColDef } from "@mui/x-data-grid";
import DataTable from "../../components/DataTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API } from "../../api/api";
import {
  HiOutlineGlobeAmericas,
  HiOutlineLockClosed,
  HiPlus,
} from "react-icons/hi2";
import AddData from "../../components/AddData";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user) {
      toast.error("Authentication required");
      navigate('/login');
      return;
    }

    const role = String(user.role || '').trim().toUpperCase();
    const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
    
    if (!isAdmin) {
      toast.error("You need admin privileges to access this page");
      navigate('/home');
    }
  }, [user, navigate]);

  const { isLoading, isSuccess, data, error } = useQuery({
    queryKey: ["allgroups"],
    queryFn: () => API.fetchAllGroups(),
    enabled: !!user && user.role === 'ROLE_ADMIN',
    retry: false,
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch groups");
      console.error("Error fetching groups:", error);
    }
  }, [error]);

  // Function to handle group deletion
  const handleDelete = async (groupId: number) => {
    try {
      await API.deleteGroup(groupId);
      toast.success("Group deleted successfully!");
      // Invalidate both the specific group query and the groups list query
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["allgroups"] });
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast.error(error.response?.data?.message || "Failed to delete group");
    }
  };

  // Function to handle group edit
  const handleEdit = async (groupId: number) => {
    // Invalidate the specific group query before navigating
    await queryClient.invalidateQueries({ queryKey: ["allgroups"] });
    navigate(`/admin/groups/${groupId}/edit`);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", minWidth: 90 },
    {
      field: "name",
      headerName: "Name",
      minWidth: 300,
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
              {params.row.name}
            </span>
            <p className="text-[14px] line-clamp-2 text-neutral-400">
              {params.row.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <div className="flex gap-1 items-center">
          <span className="text-base font-medium">{params.row.category}</span>
        </div>
      ),
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
      field: "memberCount",
      headerName: "Members",
      minWidth: 100,
      type: "number",
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
          <DataTable
            slug="groups"
            columns={columns}
            rows={[]}
            includeActionColumn={false}
          />
        ) : isSuccess ? (
          <DataTable
            slug="groups"
            columns={columns}
            rows={data}
            includeActionColumn={true}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ) : (
          <>
            <DataTable
              slug="groups"
              columns={columns}
              rows={[]}
              includeActionColumn={false}
            />
            <div className="w-full flex justify-center">
              Error while fetching groups!
            </div>
          </>
        )}
      </div>

      {/* Create Group Modal */}
      {isModalOpen && (
        <AddData 
          slug="group" 
          isOpen={isModalOpen} 
          setIsOpen={setIsModalOpen}
          onSuccess={() => {
            // Invalidate groups query to ensure UI is updated
            queryClient.invalidateQueries({ queryKey: ["allgroups"] });
          }}
        />
      )}
    </div>
  );
};

export default Groups;
