'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { updateIncidentStatus, createAction, approveAction, rejectAction } from '@/lib/api';
import { useWebSocket } from '@/context/WebSocketContext';

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
};

const statusColors: Record<string, string> = {
  open: 'bg-gray-100 text-gray-800',
  triaged: 'bg-blue-100 text-blue-800',
  investigating: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};

export default function IncidentDetail({
  incident: initialIncident,
  onUpdate,
}: {
  incident: any;
  onUpdate: () => void;
}) {
  const [incident, setIncident] = useState(initialIncident);
  const [actions, setActions] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const router = useRouter();
  const { socket } = useWebSocket();

  useEffect(() => {
    setIncident(initialIncident);
    if (initialIncident?.actions) {
      setActions(initialIncident.actions);
    }
  }, [initialIncident]);

  useEffect(() => {
    if (!socket) return;

    const handleIncidentUpdate = (updated: any) => {
      if (updated.id === incident.id) {
        setIncident(updated);
        onUpdate();
      }
    };

    const handleActionUpdate = (action: any) => {
      if (action.incidentId === incident.id) {
        setActions((prev) => {
          const index = prev.findIndex((a) => a.id === action.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = action;
            return updated;
          } else {
            return [...prev, action];
          }
        });
      }
    };

    socket.on('incident:update', handleIncidentUpdate);
    socket.on('action:update', handleActionUpdate);

    return () => {
      socket.off('incident:update', handleIncidentUpdate);
      socket.off('action:update', handleActionUpdate);
    };
  }, [socket, incident.id, onUpdate]);

  const handleStatusChange = async (status: string) => {
    try {
      await updateIncidentStatus(incident.id, status);
      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleCreateAction = async () => {
    try {
      await createAction({
        incidentId: incident.id,
        type: 'scale_deployment',
        parameters: { namespace: 'default', deployment: 'app', replicas: 3 },
        dryRun: true,
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to create action:', error);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      await approveAction(approvalId, comment);
      setComment('');
      onUpdate();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      await rejectAction(approvalId, comment);
      setComment('');
      onUpdate();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  if (!incident) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                severityColors[incident.severity] || severityColors.medium
              }`}
            >
              {incident.severity}
            </span>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                statusColors[incident.status] || statusColors.open
              }`}
            >
              {incident.status}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
          <p className="text-gray-900">{incident.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Created</span>
            <p className="text-gray-900">
              {format(new Date(incident.createdAt), 'PPp')}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Source</span>
            <p className="text-gray-900">{incident.source || 'Unknown'}</p>
          </div>
        </div>

        {incident.suggestedRunbooks && incident.suggestedRunbooks.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500 mb-2">
              Suggested Runbooks
            </h2>
            <ul className="list-disc list-inside space-y-1">
              {incident.suggestedRunbooks.map((runbook: string, idx: number) => (
                <li key={idx} className="text-gray-900 text-sm">
                  {runbook}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusChange('investigating')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Start Investigating
          </button>
          <button
            onClick={() => handleStatusChange('resolved')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Resolve
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
        <button
          onClick={handleCreateAction}
          className="mb-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Create Action
        </button>

        <div className="space-y-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{action.type}</span>
                <span className={`px-2 py-1 text-xs rounded ${
                  action.status === 'approved' ? 'bg-green-100 text-green-800' :
                  action.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {action.status}
                </span>
              </div>
              {action.approval && action.approval.status === 'pending' && (
                <div className="space-y-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add comment (optional)"
                    className="w-full border rounded p-2 text-sm"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(action.approval.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(action.approval.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
