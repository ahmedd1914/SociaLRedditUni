import React, { useState } from 'react';
import { MdMessage, MdDelete, MdVisibility, MdOutlineBarChart } from 'react-icons/md';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../../api/api';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken, MessageResponseDto, GroupMessageStats, MessageStatsDto } from '../../api/interfaces';
import toast from 'react-hot-toast';

interface Group {
  id: number;
  name: string;
}

const AdminMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState<MessageResponseDto | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  const queryClient = useQueryClient();

  // Get admin ID from token
  const getAdminId = (): number => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      
      const decodedToken: DecodedToken = jwtDecode(token);
      return decodedToken.id || 0;
    } catch (error) {
      console.error('Error decoding token:', error);
      return 0;
    }
  };

  // Placeholder groups until API is connected
  const groups: Group[] = [
    { id: 1, name: 'Computer Science' },
    { id: 2, name: 'Engineering' },
    { id: 3, name: 'Business School' }
  ];

  // Fetch messages for selected group
  const { 
    data: messages = [], 
    isLoading: messagesLoading, 
    isError: messagesError 
  } = useQuery({
    queryKey: ['groupMessages', selectedGroupId],
    queryFn: () => API.fetchGroupChatMessages(selectedGroupId as number),
    enabled: !!selectedGroupId
  });

  // Fetch stats for selected group
  const { 
    data: stats, 
    isLoading: statsLoading,
    isError: statsError
  } = useQuery<MessageStatsDto>({
    queryKey: ['groupStats', selectedGroupId],
    queryFn: () => API.getGroupMessageStats(selectedGroupId as number),
    enabled: !!selectedGroupId && showStats
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) => API.deleteMessageAsAdmin(messageId, getAdminId()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMessages', selectedGroupId] });
      toast.success('Message deleted successfully');
      setSelectedMessage(null);
    },
    onError: (error) => {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  });

  const handleViewMessage = (message: MessageResponseDto) => {
    setSelectedMessage(message);
  };

  const handleDeleteMessage = (id: number) => {
    if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      deleteMessageMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSelectGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    setSelectedMessage(null);
    setShowStats(false);
  };

  const toggleStats = () => {
    setShowStats(!showStats);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <MdMessage className="text-2xl mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Admin Messages</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Group selection sidebar */}
        <div className="md:col-span-1">
          <div className="bg-base-100 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Group Chats</h2>
            <div className="flex flex-col gap-2">
              {groups.map(group => (
                <button
                  key={group.id}
                  className={`btn btn-sm ${selectedGroupId === group.id ? 'btn-primary' : 'btn-ghost'} justify-start`}
                  onClick={() => handleSelectGroup(group.id)}
                >
                  {group.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages content area */}
        <div className="md:col-span-3">
          {!selectedGroupId ? (
            <div className="bg-base-100 rounded-lg shadow p-6 text-center">
              <MdMessage className="text-4xl text-base-300 mx-auto mb-2" />
              <p>Please select a group to view messages</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {groups.find(g => g.id === selectedGroupId)?.name} Messages
                </h2>
                <button
                  className={`btn btn-sm ${showStats ? 'btn-primary' : 'btn-outline'}`}
                  onClick={toggleStats}
                >
                  <MdOutlineBarChart className="mr-1" />
                  {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
              </div>

              {/* Stats panel */}
              {showStats && (
                <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
                  {statsLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <div className="loading loading-spinner loading-md"></div>
                    </div>
                  ) : statsError ? (
                    <div className="text-error">Failed to load statistics</div>
                  ) : stats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title">Total Messages</div>
                        <div className="stat-value text-2xl">{stats.totalMessages}</div>
                      </div>
                      <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title">Deleted Messages</div>
                        <div className="stat-value text-2xl">{stats.deletedForEveryone}</div>
                      </div>
                      <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title">Messages by Sender</div>
                        <div className="stat-value text-xl truncate">
                          {Object.entries(stats.messagesBySender || {}).map(([sender, count]) => (
                            <div key={sender}>{sender}: {count}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">No statistics available</div>
                  )}
                </div>
              )}

              {/* Messages table */}
              <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
                {messagesLoading ? (
                  <div className="flex justify-center items-center p-10">
                    <div className="loading loading-spinner loading-lg"></div>
                  </div>
                ) : messagesError ? (
                  <div className="alert alert-error m-4">
                    <p>Error loading messages. Please try again later.</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center p-6">
                    <p>No messages found in this group.</p>
                  </div>
                ) : (
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Sender</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((message) => (
                        <tr key={message.senderId}>
                          <td>{message.senderId}</td>
                          <td className="max-w-xs truncate">{message.content}</td>
                          <td>{formatDate(message.sentAt)}</td>
                          <td className="flex gap-2">
                            <button
                              onClick={() => handleViewMessage(message as unknown as MessageResponseDto)}
                              className="btn btn-sm btn-primary btn-circle"
                            >
                              <MdVisibility />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message.senderId)}
                              className="btn btn-sm btn-error btn-circle"
                            >
                              <MdDelete />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Message details */}
          {selectedMessage && (
            <div className="mt-6 bg-base-100 p-4 rounded-lg shadow">
              <div className="flex justify-between mb-4">
                <h2 className="text-lg font-bold">Message Details</h2>
                <button 
                  className="btn btn-sm btn-ghost"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-base-content/70">From:</p>
                  <p>{selectedMessage.sender}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Date:</p>
                  <p>{formatDate(selectedMessage.timestamp)}</p>
                </div>
                {selectedMessage.groupName && (
                  <div>
                    <p className="text-sm text-base-content/70">Group:</p>
                    <p>{selectedMessage.groupName}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-base-content/70">Message:</p>
                <div className="p-3 bg-base-200 rounded-lg mt-1">
                  {selectedMessage.content}
                </div>
              </div>
              <div className="mt-4">
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                >
                  <MdDelete className="mr-1" /> Delete Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages; 