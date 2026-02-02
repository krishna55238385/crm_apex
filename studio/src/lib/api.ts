import { Deal, Task, Analytics } from './types';

import { auth } from './firebase';

// Use internal URL for server-side requests (Docker network), public URL for client-side
export const API_BASE_URL = (typeof window === 'undefined' && process.env.INTERNAL_API_URL)
    ? process.env.INTERNAL_API_URL
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1');

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }
    return {
        'Content-Type': 'application/json',
    };
};

const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const headers = await getAuthHeaders();
    const config: RequestInit = {
        ...options,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string>),
        },
    };
    return fetch(url, config);
};

export interface DashboardStats {
    pipelineValue: number;
    newLeads: number;
    dealsWon: number;
    closeRatio: number;
    recentTasks: Task[];
    pipelineByStage: { stage: string; count: number; value: number }[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
    const res = await authenticatedFetch(`${API_BASE_URL}/dashboard/stats`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        let errorMsg = `Failed to fetch dashboard stats: ${res.status} ${res.statusText}`;
        try {
            const errorBody = await res.text();
            errorMsg += ` - ${errorBody}`;
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
    }

    return await res.json();
}

export async function fetchSessions(): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/sessions`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
}

export async function fetchUsers(): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/users`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
}

export async function updateUser(id: string, data: any): Promise<any> {
    const res = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return await res.json();
}

export async function syncUser(data: { id: string; email: string; name: string; avatarUrl?: string }, token?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await authenticatedFetch(`${API_BASE_URL}/users/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        let errorMsg = `Failed to sync user: ${res.status} ${res.statusText}`;
        try {
            const errorBody = await res.text();
            errorMsg += ` - ${errorBody}`;
        } catch (e) {
            // ignore
        }
        throw new Error(errorMsg);
    }
}


import { Lead, PaginatedResponse, LeadQueryParams } from './types';

export async function fetchLeads(params?: LeadQueryParams): Promise<PaginatedResponse<Lead>> {
    const searchParams = new URLSearchParams();
    if (params) {
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.status) searchParams.append('status', params.status);
        if (params.ownerId) searchParams.append('ownerId', params.ownerId);
        if (params.source) searchParams.append('source', params.source);
        if (params.followUpStatus) searchParams.append('followUpStatus', params.followUpStatus);
        if (params.search) searchParams.append('search', params.search);
        if (params.temperature) searchParams.append('temperature', params.temperature);
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await authenticatedFetch(`${API_BASE_URL}/leads${query}`, { cache: 'no-store' });
    if (!res.ok) {
        console.error("fetchLeads failed", res.status);
        return [] as any; // Fail safe
    }
    const data = await res.json();
    // Return data directly if it adheres to PaginatedResponse structure (has data property)
    // Otherwise check for array or legacy 'leads' property
    if (data && Array.isArray(data.data)) {
        return data;
    }
    return (Array.isArray(data) ? { data: data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } } : (data.leads ? { data: data.leads, meta: { total: data.leads.length, page: 1, limit: 50, totalPages: 1 } } : { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 1 } }));

}

export class ValidationError extends Error {
    errors: Record<string, string>;
    constructor(message: string, errors: any[]) {
        super(message);
        this.name = 'ValidationError';
        this.errors = {};
        errors.forEach((err: any) => {
            // Zod error path is an array [body, fieldname]
            const field = err.path.join('.');
            this.errors[field] = err.message;
        });
    }
}

export async function createLead(data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 400 && errorData.errors) {
            throw new ValidationError(errorData.message, errorData.errors);
        }
        throw new Error(errorData.message || 'Failed to create lead');
    }
}

export async function fetchLead(id: string): Promise<any> {
    const res = await authenticatedFetch(`${API_BASE_URL}/leads/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch lead');
    return await res.json();
}


export async function fetchDeals(): Promise<Deal[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/deals`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch deals');
    return await res.json();
}

export async function createDeal(data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/deals`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create deal');
}

export async function updateDeal(id: string, data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/deals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update deal');
}

export async function deleteDeal(id: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/deals/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete deal');
}


export async function fetchTasks(): Promise<Task[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/tasks`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return await res.json();
}

export async function fetchActivityLogs(): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/activity-logs`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    return await res.json();
}

export async function fetchAttendance(): Promise<any[]> {
    try {
        const res = await authenticatedFetch(`${API_BASE_URL}/analytics/attendance`, { cache: 'no-store' });
        if (!res.ok) return []; // Return empty if failed (e.g. 404 or 500) to prevent page crash
        return await res.json();
    } catch (error) {
        console.error("fetchAttendance failed:", error);
        return [];
    }
}

export async function checkIn(userId: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/analytics/attendance/check-in`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to check in');
    }
}

export async function checkOut(userId: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/analytics/attendance/check-out`, {
        method: 'PUT',
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to check out');
}

export async function fetchFollowUps(): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/follow-ups`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch follow-ups');
    return await res.json();
}

export async function fetchAnalytics(): Promise<Analytics> {
    const res = await authenticatedFetch(`${API_BASE_URL}/analytics`, { cache: 'no-store' });
    if (!res.ok) {
        let errorMsg = `Failed to fetch analytics: ${res.status} ${res.statusText}`;
        try {
            const errorBody = await res.text();
            errorMsg += ` - ${errorBody}`;
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
    }
    return await res.json();
}

export async function deleteLead(id: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/leads/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete lead');
}

export async function updateLead(id: string, data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update lead');
}

export async function addNote(id: string, note: string, userName?: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/leads/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note, userName }),
    });
    if (!res.ok) throw new Error('Failed to add note');
}

export async function fetchNotifications(userId?: string): Promise<any[]> {
    const query = userId ? `?userId=${userId}` : '';
    const res = await authenticatedFetch(`${API_BASE_URL}/notifications${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
}

export async function markNotificationAsRead(id: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
}

export async function markAllNotificationsAsRead(): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to mark all notifications as read');
}

export async function createFollowUp(data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/follow-ups`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create follow-up');
}

export async function updateFollowUp(id: string, data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/follow-ups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update follow-up');
}


export async function fetchSettings(key: string): Promise<any> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/${key}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
}

export async function saveSettings(key: string, data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save settings');
}


// Invites & User Management
export async function getInvites(): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/invites`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
}

export async function createInvite(data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/invites`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to send invite');
    }
}

export async function deleteInvite(id: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/invites/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete invite');
}

export async function updateUserStatus(id: string, status: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update user status');
}

export async function deleteUser(id: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete user');
    }
}

export async function reassignWork(id: string, targetUserId: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/users/${id}/reassign`, {
        method: 'POST',
        body: JSON.stringify({ targetUserId }),
    });
    if (!res.ok) throw new Error('Failed to reassign work');
}


// Roles
export async function getRoles(): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/roles`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
}

export async function createRole(data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/roles`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create role');
    }
}

export async function updateRole(id: string, data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update role');
}

// Lead Management Settings
export async function getLeadStatuses(): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/lead-statuses`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
}

export async function addLeadStatus(label: string, orderIndex?: number): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/lead-statuses`, {
        method: 'POST',
        body: JSON.stringify({ label, orderIndex }),
    });
    if (!res.ok) throw new Error('Failed to add status');
}

export async function updateLeadStatus(id: string, data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/lead-statuses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update status');
}

export async function deleteLeadStatus(id: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/lead-statuses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete status');
}

export async function getPipelineStages(): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/pipeline-stages`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
}

export async function addPipelineStage(label: string, orderIndex?: number): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/pipeline-stages`, {
        method: 'POST',
        body: JSON.stringify({ label, orderIndex }),
    });
    if (!res.ok) throw new Error('Failed to add stage');
}

export async function updatePipelineStage(id: string, data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/pipeline-stages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update stage');
}

export async function deletePipelineStage(id: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/pipeline-stages/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete stage');
}

// Assignment Rules
export async function getAssignmentRules(): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/assignment-rules`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
}

export async function addAssignmentRule(data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/assignment-rules`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add rule');
}

export async function updateAssignmentRule(id: string, data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/settings/assignment-rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update rule');
}


// Workflows
export async function fetchWorkflows(): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/workflows`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
}

export async function createWorkflow(data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/workflows`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create workflow');
}

export async function updateWorkflow(id: string, data: any): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update workflow');
}

export async function deleteWorkflow(id: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/workflows/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete workflow');
}

export async function fetchWorkflowLogs(params: string): Promise<any[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/workflows/logs?${params}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
}

export async function generateWorkflowConfig(prompt: string): Promise<any> {
    const res = await authenticatedFetch(`${API_BASE_URL}/ai/generate-workflow`, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Failed to generate workflow configuration');
    return await res.json();
}
