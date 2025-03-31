import { useState, useEffect } from "react";
import { GridColDef } from "@mui/x-data-grid";
import DataTable from "../../components/DataTable";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../api/api";
import { HiPlus, HiOutlineGlobeAmericas, HiOutlineLockClosed } from "react-icons/hi2";
import { EventStatus, EventPrivacy, EventResponseDto } from "../../api/interfaces";
import AddData from "../../components/AddData";
import { Dialog } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Events = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error("You need admin privileges to access this page");
      navigate('/');
    }
  }, [user, navigate]);

  const { isLoading, isSuccess, data, error } = useQuery<EventResponseDto[]>({
    queryKey: ["allevents"],
    queryFn: () => API.fetchAllEvents(),
    enabled: !!user && user.role === 'ADMIN',
    retry: false,
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch events");
      console.error("Error fetching events:", error);
    }
  }, [error]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", minWidth: 90 },
    {
      field: "name",
      headerName: "Event",
      minWidth: 500,
      flex: 1,
      renderCell: (params) => (
        <div className="flex flex-col items-start gap-0">
          <span className="text-base font-medium dark:text-white">
            {params.row.name}
          </span>
          <p className="text-[14px] line-clamp-2 text-neutral-400">
            {params.row.description}
          </p>
          <span className="text-sm text-neutral-500">
            {new Date(params.row.date).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "category",
      headerName: "Category",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <div className="flex gap-1 items-center">
          <span className="text-base font-medium">
            {params.row.category || "Uncategorized"}
          </span>
        </div>
      ),
    },
    {
      field: "privacy",
      headerName: "Privacy",
      minWidth: 120,
      flex: 1,
      renderCell: (params) =>
        params.row.privacy === EventPrivacy.PUBLIC ? (
          <div className="flex gap-1 items-center">
            <HiOutlineGlobeAmericas className="text-lg" />
            <span>{params.row.privacy}</span>
          </div>
        ) : (
          <div className="flex gap-1 items-center">
            <HiOutlineLockClosed className="text-lg" />
            <span>{params.row.privacy}</span>
          </div>
        ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded-full text-sm ${
          params.row.status === EventStatus.COMPLETED
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            : params.row.status === EventStatus.SCHEDULED
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {params.row.status}
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      minWidth: 120,
      renderCell: (params) => (
        <div>{new Date(params.row.createdAt).toLocaleString()}</div>
      ),
    },
  ];

  return (
    <div className="w-full p-0 m-0">
      <div className="w-full flex flex-col items-stretch gap-3">
        <div className="w-full flex justify-between mb-5">
          <div className="flex flex-col">
            <h2 className="font-bold text-2xl xl:text-4xl text-base-content dark:text-neutral-200">
              Events
            </h2>
            {data && data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {data.length} Events Found
              </span>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <HiPlus className="text-lg" />
            Create Event
          </button>
        </div>

        {isLoading ? (
          <DataTable
            slug="events"
            columns={columns}
            rows={[]}
            includeActionColumn={false}
          />
        ) : isSuccess ? (
          <DataTable
            slug="events"
            columns={columns}
            rows={data}
            includeActionColumn={true}
          />
        ) : (
          <>
            <DataTable
              slug="events"
              columns={columns}
              rows={[]}
              includeActionColumn={false}
            />
            <div className="w-full flex justify-center">
              Error while fetching events!
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Event Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <div className="p-6 bg-base-100">
          <AddData
            slug="events"
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            editId={selectedEvent}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default Events;