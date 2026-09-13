// ============================================================
// lib/api.ts - FitVibe Frontend API Configuration
// =====================================================================
// Tất cả API endpoints đều được định nghĩa tập trung tại đây.
// Khi cần đổi base URL (ví dụ sang production), chỉ cần đổi API_BASE_URL.
// =====================================================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL !== undefined 
    ? process.env.NEXT_PUBLIC_API_URL 
    : (typeof window !== 'undefined' ? '' : (process.env.BACKEND_INTERNAL_URL || 'http://backend:5000'));


// ── Helper ──────────────────────────────────────────────────────────
function getToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('fitvibe-token');
    }
    return null;
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function request<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, options);
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────────
export const authApi = {
    login: (email: string, password: string) =>
        request<{ token: string; user: Record<string, unknown> }>('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        }),

    register: (data: FormData | any) => {
        const isFormData = data instanceof FormData;
        return fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: isFormData ? { Authorization: `Bearer ${getToken()}` } : { 'Content-Type': 'application/json' },
            body: isFormData ? data : JSON.stringify(data),
        }).then(res => {
            if (!res.ok) return res.json().then(d => { throw new Error(d.message || 'Signup failed') });
            return res.json();
        });
    },
};

// ── Categories (Public) ───────────────────────────────────────────────
export const categoryApi = {
    getAll: () => request<{ id: number; name: string; type: string }[]>('/api/categories'),
};

// ── Admin ─────────────────────────────────────────────────────────────
export const adminApi = {
    // Stats & Reports
    getStats: () =>
        request<{ total_users: number; new_posts_month: number }>('/api/admin/stats', {
            headers: authHeaders(),
        }),

    getReports: () =>
        request<Record<string, unknown>>('/api/admin/reports', {
            headers: authHeaders(),
        }),

    // Users
    getAllUsers: () =>
        request<Record<string, unknown>[]>('/api/admin/users', {
            headers: authHeaders(),
        }),

    updateUserStatus: (id: number, status: string) =>
        request<{ message: string }>(`/api/admin/users/${id}/status`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status }),
        }),

    deleteUser: (id: number) =>
        request<{ message: string }>(`/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        }),

    resetUserPassword: (id: number) =>
        request<{ message: string }>(`/api/admin/users/${id}/reset-password`, {
            method: 'PUT',
            headers: authHeaders(),
        }),

    // Posts
    getPendingPosts: () =>
        request<Record<string, unknown>[]>('/api/admin/pending-posts', {
            headers: authHeaders(),
        }),

    updatePostStatus: (id: number, status: 'approved' | 'rejected') =>
        request<{ message: string }>(`/api/admin/posts/${id}/status`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status }),
        }),

    // Categories (Admin write)
    createCategory: (name: string, type: string) =>
        request<{ message: string; id: number }>('/api/admin/categories', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ name, type }),
        }),

    updateCategory: (id: number, name: string, type: string) =>
        request<{ message: string }>(`/api/admin/categories/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ name, type }),
        }),

    deleteCategory: (id: number) =>
        request<{ message: string }>(`/api/admin/categories/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        }),

    // Coaches
    getPendingCoaches: () =>
        request<Record<string, unknown>[]>('/api/admin/pending-coaches', {
            headers: authHeaders(),
        }),

    // Withdrawals
    getWithdrawals: () =>
        request<Record<string, unknown>[]>('/api/admin/withdrawals', {
            headers: authHeaders(),
        }),

    updateWithdrawalStatus: (id: number, status: 'approved' | 'rejected') =>
        request<{ message: string }>(`/api/admin/withdrawals/${id}/status`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status }),
        }),
};

// ── User ──────────────────────────────────────────────────────────────
export const userApi = {
    getMe: () =>
        request<Record<string, unknown>>('/api/users/me', {
            headers: authHeaders(),
        }),

    getCoaches: () =>
        request<Record<string, unknown>[]>('/api/users/coaches', {
            headers: authHeaders(),
        }),

    getCoachById: (id: number) =>
        request<Record<string, unknown>>(`/api/users/coaches/${id}`, {
            headers: authHeaders(),
        }),

    updateProfile: (data: Record<string, unknown>) =>
        request<{ message: string }>('/api/users/profile', {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }),

    updateCoachProfile: (data: FormData) =>
        fetch(`${API_BASE_URL}/api/users/coach-profile`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${getToken()}` },
            body: data,
        }).then(res => res.json()),

    deleteCertificate: (id: number) =>
        request<{ message: string }>(`/api/users/certificates/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        }),

    getPosts: (category_id?: number, keyword?: string, enrolled_only?: boolean) => {
        const params = new URLSearchParams();
        if (category_id) params.append('category_id', category_id.toString());
        if (keyword) params.append('keyword', keyword);
        if (enrolled_only) params.append('enrolled_only', 'true');
        return request<Record<string, unknown>[]>(`/api/users/posts?${params.toString()}`, {
            headers: authHeaders(),
        });
    },

    getRoutes: () =>
        request<Record<string, unknown>[]>('/api/users/routes', {
            headers: authHeaders(),
        }),

    addComment: (postId: number, content: string) =>
        request<{ message: string }>(`/api/users/posts/${postId}/comments`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ content }),
        }),

    getWeightLogs: () =>
        request<Record<string, unknown>[]>('/api/users/weight-logs', {
            headers: authHeaders(),
        }),

    logWeight: (weight: number) =>
        request<{ message: string }>('/api/users/weight-logs', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ weight }),
        }),

    toggleBookmark: (postId: number) =>
        request<{ message: string }>(`/api/users/posts/${postId}/bookmarks`, {
            method: 'POST',
            headers: authHeaders(),
        }),

    getBookmarks: () =>
        request<Record<string, unknown>[]>('/api/users/bookmarks', {
            headers: authHeaders(),
        }),

    getRouteStages: (routeId: number) =>
        request<Record<string, unknown>[]>(`/api/users/routes/${routeId}/stages`, {
            headers: authHeaders(),
        }),

    submitStage: (stageId: number, submission_video_url: string) =>
        request<{ message: string }>(`/api/users/routes/stages/${stageId}/submit`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ submission_video_url }),
        }),

    enrollInCoach: (coach_id: number) =>
        request<{ message: string }>('/api/users/enroll', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ coach_id }),
        }),

    cancelEnrollment: (coachId: number) =>
        request<{ message: string }>(`/api/users/enroll/${coachId}`, {
            method: 'DELETE',
            headers: authHeaders(),
        }),

    incrementPostView: (postId: number) =>
        request<{ message: string }>(`/api/users/posts/${postId}/view`, {
            method: 'POST',
            headers: authHeaders(),
        }),

    changePassword: (data: Record<string, string>) =>
        request<{ message: string }>('/api/users/change-password', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }),

    updateAvatar: (formData: FormData) =>
        fetch(`${API_BASE_URL}/api/users/avatar`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        }).then(res => {
            if (!res.ok) throw new Error('Upload failed');
            return res.json();
        }),

    purchaseContent: (content_id: number, content_type: 'post' | 'route', price_paid: number) =>
        request<{ message: string }>('/api/users/purchase', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ content_id, content_type, price_paid }),
        }),

    topUpBalance: (amount: number) =>
        request<{ success: boolean; data: { paymentUrl: string } }>('/api/payment/vnpay/create-payment', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ amount }),
        }),

    getRecommendations: () =>
        request<Record<string, any>[]>('/api/users/recommendations', {
            headers: authHeaders(),
        }),
};

// ── Coach ─────────────────────────────────────────────────────────────
export const coachApi = {
    getStats: () =>
        request<{ total_posts: number; published_posts: number; pending_posts: number; pending_submissions: number; total_clients: number; balance: number }>('/api/coach/stats', {
            headers: authHeaders(),
        }),

    getClients: () =>
        request<Record<string, unknown>[]>('/api/coach/clients', {
            headers: authHeaders(),
        }),

    getMyPosts: () =>
        request<Record<string, unknown>[]>('/api/coach/posts', {
            headers: authHeaders(),
        }),

    getMyRoutes: () =>
        request<Record<string, unknown>[]>('/api/coach/routes', {
            headers: authHeaders(),
        }),

    createPost: (data: Record<string, unknown>) =>
        request<{ message: string; id: number }>('/api/coach/posts', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }),

    createRoute: (data: Record<string, unknown>) =>
        request<{ message: string; id: number }>('/api/coach/routes', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }),

    getSubmissions: () =>
        request<Record<string, unknown>[]>('/api/coach/submissions', {
            headers: authHeaders(),
        }),

    evaluateSubmission: (submissionId: number, status: 'passed' | 'failed', coach_feedback: string) =>
        request<{ message: string }>(`/api/coach/submissions/${submissionId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status, coach_feedback }),
        }),

    updatePost: (id: number, data: Record<string, unknown>) =>
        request<{ message: string }>(`/api/coach/posts/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }),

    deletePost: (id: number) =>
        request<{ message: string }>(`/api/coach/posts/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        }),

    updateRoute: (id: number, data: Record<string, unknown>) =>
        request<{ message: string }>(`/api/coach/routes/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }),

    deleteRoute: (id: number) =>
        request<{ message: string }>(`/api/coach/routes/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        }),

    getMyRouteStages: (routeId: number) =>
        request<Record<string, unknown>[]>(`/api/coach/routes/${routeId}/stages`, {
            headers: authHeaders(),
        }),

    addRouteStage: (routeId: number, data: Record<string, unknown>) =>
        request<{ message: string; id: number }>(`/api/coach/routes/${routeId}/stages`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }),

    updateRouteStage: (id: number, data: Record<string, unknown>) =>
        request<{ message: string }>(`/api/coach/stages/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }),

    deleteRouteStage: (id: number) =>
        request<{ message: string }>(`/api/coach/stages/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        }),

    // Withdrawals
    requestWithdrawal: (data: { amount: number, bank_name: string, account_number: string, account_name: string }) =>
        request<{ message: string; id: number }>('/api/coach/withdraw', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }),

    getWithdrawals: () =>
        request<Record<string, unknown>[]>('/api/coach/withdrawals', {
            headers: authHeaders(),
        }),
};

// ── AI ────────────────────────────────────────────────────────────────
export const aiApi = {
    chat: (message: string, history?: { role: string, content: string }[], userContext?: any) =>
        request<{ success: boolean; reply: string; provider?: string }>('/api/ai/chat', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ message, history, userContext }),
        }),
    getRecommendation: (profileData: any) =>
        request<{ success: boolean; recommendation: string }>('/api/ai/recommendation', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(profileData),
        }),
};

// ── Video ──────────────────────────────────────────────────────────────
export const videoApi = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('video', file);
        return fetch(`${API_BASE_URL}/api/video/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
        }).then(res => {
            if (!res.ok) return res.json().then(d => { throw new Error(d.message || 'Upload failed') });
            return res.json() as Promise<{ success: boolean; filename: string }>;
        });
    },
    getStreamUrl: (filename: string) => {
        const token = getToken();
        return `${API_BASE_URL}/api/video/stream/${filename}?token=${token}`;
    },
};

// ── Helpers ────────────────────────────────────────────────────────────
export function isYoutubeUrl(url: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
}
