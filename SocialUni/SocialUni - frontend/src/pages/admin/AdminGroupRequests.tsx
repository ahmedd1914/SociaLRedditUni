import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { API } from "../../api/api";
import { 
  DecodedToken, 
  GroupResponseDto, 
  RequestDto,
  UsersDto 
} from "../../api/interfaces";
import { 
  HiOutlineUserGroup, 
  HiOutlineExclamationCircle, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle,
  HiArrowPath,
  HiAdjustmentsHorizontal
} from "react-icons/hi2";
import { MdPersonAdd, MdCheck, MdClose, MdSearch } from 'react-icons/md';
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface GroupJoinRequest extends RequestDto {
  groupId: number;
  groupName: string;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const GroupRequests = () => {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error("You need admin privileges to access this page");
      navigate('/');
    }
  }, [user, navigate]);

  // Get user info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to login first");
      navigate('/login');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      setCurrentUserId(parseInt(decoded.sub, 10));
      setIsAdmin(decoded.role === "ROLE_ADMIN");
    } catch (error) {
      console.error("Failed to decode token:", error);
      toast.error("Authentication error");
      navigate('/login');
    }
  }, [navigate]);

  // Fetch all groups
  const { 
    data: groups = [], 
    isLoading: groupsLoading, 
    isError: groupsError,
    error: groupsErrorObj
  } = useQuery({
    queryKey: ["groups"],
    queryFn: () => API.fetchAllGroups(),
    enabled: !!currentUserId,
    retry: false,
  });

  // Show error toast if groups query fails
  useEffect(() => {
    if (groupsErrorObj) {
      toast.error("Failed to fetch groups");
      console.error("Error fetching groups:", groupsErrorObj);
    }
  }, [groupsErrorObj]);

  // Fetch the selected group details
  const { 
    data: selectedGroup,
    isLoading: selectedGroupLoading,
  } = useQuery({
    queryKey: ["group", selectedGroupId],
    queryFn: () => API.fetchGroupById(selectedGroupId!),
    enabled: !!selectedGroupId && !!currentUserId,
  });

  // Check if user is admin or owner of the selected group
  const canManageRequests = React.useMemo(() => {
    if (isAdmin) return true;
    if (!selectedGroup || !currentUserId) return false;
    
    return selectedGroup.ownerId === currentUserId || 
           selectedGroup.adminIds.includes(currentUserId);
  }, [selectedGroup, currentUserId, isAdmin]);

  // Fetch pending join requests for the selected group
  const { 
    data: pendingRequests = [], 
    isLoading: requestsLoading, 
    isError: requestsError,
    refetch: refetchRequests
  } = useQuery({
    queryKey: ["groupRequests", selectedGroupId],
    queryFn: () => API.getPendingJoinRequests(selectedGroupId!, currentUserId!),
    enabled: !!selectedGroupId && !!currentUserId && canManageRequests,
  });

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: (requestId: number) => API.approveJoinRequest(selectedGroupId!, requestId, currentUserId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupRequests"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
      toast.success("Request approved successfully");
      refetchRequests();
    },
    onError: () => {
      toast.error("Failed to approve request");
    }
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: (requestId: number) => API.rejectJoinRequest(selectedGroupId!, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupRequests"] });
      toast.success("Request rejected");
      refetchRequests();
    },
    onError: () => {
      toast.error("Failed to reject request");
    }
  });

  // Handle group selection
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = parseInt(e.target.value, 10);
    setSelectedGroupId(isNaN(groupId) ? null : groupId);
  };

  // Handle approve request
  const handleApprove = (userId: number) => {
    if (!selectedGroupId || !currentUserId) return;
    approveMutation.mutate(userId);
  };

  // Handle reject request
  const handleReject = (userId: number) => {
    if (!selectedGroupId) return;
    rejectMutation.mutate(userId);
  };

  // Filter groups where user is admin or owner
  const managedGroups = React.useMemo(() => {
    if (!currentUserId) return [];
    
    return groups.filter(group => 
      isAdmin || 
      group.ownerId === currentUserId || 
      group.adminIds.includes(currentUserId)
    );
  }, [groups, currentUserId, isAdmin]);

  // Filter and search requests
  const filteredRequests = (pendingRequests as GroupJoinRequest[]).filter(request => {
    // Filter by status
    if (filterStatus !== 'ALL' && request.status !== filterStatus) {
      return false;
    }
    
    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        request.username.toLowerCase().includes(search) ||
        request.groupName.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <MdPersonAdd className="text-2xl mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Group Join Requests</h1>
      </div>

      {/* Group Selection */}
      <div className="mb-6">
        <select
          className="select select-bordered w-full max-w-xs"
          value={selectedGroupId || ''}
          onChange={handleGroupChange}
          disabled={groupsLoading}
        >
          <option value="">Select a group</option>
          {managedGroups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MdSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              className="input input-bordered w-full pl-10"
              placeholder="Search by user or group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="font-medium">Status:</label>
          <select
            className="select select-bordered"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        {requestsLoading ? (
          <div className="flex justify-center items-center p-10">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : requestsError ? (
          <div className="alert alert-error m-4">
            <p>Error loading group requests. Please try again later.</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center p-6">
            <p>No group requests found matching your criteria.</p>
          </div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Group</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div className="font-medium">{request.username}</div>
                    <div className="text-sm text-gray-500">ID: {request.id}</div>
                  </td>
                  <td>
                    <div className="font-medium">{request.groupName}</div>
                    <div className="text-sm text-gray-500">ID: {request.groupId}</div>
                  </td>
                  <td>{request.requestDate}</td>
                  <td>
                    <span className={`badge ${
                      request.status === 'APPROVED' ? 'badge-success' : 
                      request.status === 'REJECTED' ? 'badge-error' : 
                      'badge-warning'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="btn btn-sm btn-success btn-circle"
                          disabled={!canManageRequests || approveMutation.isPending}
                        >
                          <MdCheck />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="btn btn-sm btn-error btn-circle"
                          disabled={!canManageRequests || rejectMutation.isPending}
                        >
                          <MdClose />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!canManageRequests && (
        <div className="alert alert-warning mt-4">
          <p>Note: Only group administrators and owners can manage join requests.</p>
        </div>
      )}
    </div>
  );
};

export default GroupRequests; 