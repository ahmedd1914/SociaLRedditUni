import React, { useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import DataTable from "../components/DataTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchAllGroups } from "../api/ApiCollection";
import {
  HiOutlineGlobeAmericas,
  HiOutlineLockClosed,
  HiPlus,
} from "react-icons/hi2";
import AddData from "../components/AddData";

const Groups = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isLoading, isSuccess, data } = useQuery({
    queryKey: ["allgroups"],
    queryFn: fetchAllGroups,
  });

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
        <AddData slug="group" isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      )}
    </div>
  );
};

export default Groups;
