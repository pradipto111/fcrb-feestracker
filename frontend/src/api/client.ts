const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

let token: string | null = localStorage.getItem("token");

export function setToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}

async function request(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    // Get fresh token from localStorage on each request
    const currentToken = localStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    if (currentToken) headers["Authorization"] = `Bearer ${currentToken}`;

    const url = `${API_BASE}${path}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorMessage = res.statusText;
      try {
        const text = await res.text();
        if (text) {
          try {
            const json = JSON.parse(text);
            errorMessage = json.message || json.error || text;
          } catch {
            errorMessage = text;
          }
        }
      } catch {
        // If we can't read the error, use status text
      }
      console.error(`API Error: ${res.status} ${errorMessage}`);
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      throw error;
    }

    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return null;
  } catch (error: any) {
    console.error(`API Request Failed:`, error);
    // Handle network errors
    if (error.name === "AbortError") {
      throw new Error("Request timeout. The server is taking too long to respond. Please check if the backend is running.");
    }
    if (error.name === "TypeError" && (error.message.includes("fetch") || error.message.includes("Failed to fetch"))) {
      throw new Error(`Unable to connect to server at ${API_BASE}. Please ensure:\n1. The backend server is running on port 4000\n2. Your firewall is not blocking the connection\n3. The backend URL is correct in your environment variables`);
    }
    throw error;
  }
}

export const api = {
  login(email: string, password: string) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  getDashboardSummary(params?: { from?: string; to?: string; centerId?: string }) {
    const query = new URLSearchParams(params || {});
    return request(`/dashboard/summary?${query.toString()}`);
  },
  getRevenueCollections(params?: { months?: number; centerId?: string; paymentMode?: string }) {
    const query = new URLSearchParams();
    if (params?.months) query.set("months", params.months.toString());
    if (params?.centerId) query.set("centerId", params.centerId);
    if (params?.paymentMode) query.set("paymentMode", params.paymentMode);
    return request(`/dashboard/revenue-collections?${query.toString()}`);
  },
  getMonthlyCollections(params?: { months?: number; centerId?: string; paymentMode?: string }) {
    const query = new URLSearchParams();
    if (params?.months) query.set("months", params.months.toString());
    if (params?.centerId) query.set("centerId", params.centerId);
    if (params?.paymentMode) query.set("paymentMode", params.paymentMode);
    return request(`/dashboard/monthly-collections?${query.toString()}`);
  },
  getStudents(q?: string) {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    return request(`/students?${query.toString()}`);
  },
  getStudent(id: number) {
    return request(`/students/${id}`);
  },
  createPayment(data: any) {
    return request("/payments", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  // Student-specific endpoints
  getStudentDashboard() {
    return request("/student/dashboard");
  },
  getStudentProfile() {
    return request("/student/profile");
  },
  // Admin - Center management
  getCenters() {
    return request("/centers");
  },
  getCenter(id: number) {
    return request(`/centers/${id}`);
  },
  createCenter(data: any) {
    return request("/centers", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  // Admin - Student management
  createStudent(data: any) {
    return request("/students", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  updateStudent(id: number, data: any) {
    return request(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  // Coach management
  getCoaches() {
    return request("/coaches");
  },
  // System date management
  getSystemDate() {
    return request("/system/date");
  },
  setSystemDate(date: string) {
    return request("/system/date", {
      method: "POST",
      body: JSON.stringify({ date })
    });
  },
  resetSystemDate() {
    return request("/system/date", {
      method: "DELETE"
    });
  },
  // Attendance endpoints
  createSession(data: { centerId: number; sessionDate: string; startTime: string; endTime: string; notes?: string }) {
    return request("/attendance/sessions", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  createBulkSessions(data: { centerId: number; sessions: Array<{ sessionDate: string; startTime: string; endTime: string; notes?: string }> }) {
    return request("/attendance/sessions/bulk", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  getSessions(params?: { centerId?: number; month?: number; year?: number }) {
    const query = new URLSearchParams();
    if (params?.centerId) query.set("centerId", params.centerId.toString());
    if (params?.month) query.set("month", params.month.toString());
    if (params?.year) query.set("year", params.year.toString());
    return request(`/attendance/sessions?${query.toString()}`);
  },
  getSession(id: number) {
    return request(`/attendance/sessions/${id}`);
  },
  updateSession(id: number, data: { sessionDate?: string; startTime?: string; endTime?: string; notes?: string }) {
    return request(`/attendance/sessions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  deleteSession(id: number) {
    return request(`/attendance/sessions/${id}`, {
      method: "DELETE"
    });
  },
  markAttendance(sessionId: number, data: { studentId: number; status: "PRESENT" | "ABSENT" | "EXCUSED"; notes?: string }) {
    return request(`/attendance/sessions/${sessionId}/attendance`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  bulkMarkAttendance(sessionId: number, attendanceList: Array<{ studentId: number; status: "PRESENT" | "ABSENT" | "EXCUSED"; notes?: string }>) {
    return request(`/attendance/sessions/${sessionId}/attendance/bulk`, {
      method: "POST",
      body: JSON.stringify({ attendanceList })
    });
  },
  getStudentAttendance(params?: { month?: number; year?: number }) {
    const query = new URLSearchParams();
    if (params?.month) query.set("month", params.month.toString());
    if (params?.year) query.set("year", params.year.toString());
    return request(`/attendance/student/attendance?${query.toString()}`);
  },
  // Fixtures endpoints
  createFixture(data: {
    centerId: number;
    matchType: string;
    opponent?: string;
    matchDate: string;
    matchTime: string;
    venue?: string;
    notes?: string;
    playerIds?: number[];
    positions?: string[];
    roles?: string[];
    playerNotes?: string[];
  }) {
    return request("/fixtures", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  getFixtures(params?: { centerId?: number; fromDate?: string; toDate?: string; status?: string; upcoming?: boolean }) {
    const query = new URLSearchParams();
    if (params?.centerId) query.set("centerId", params.centerId.toString());
    if (params?.fromDate) query.set("fromDate", params.fromDate);
    if (params?.toDate) query.set("toDate", params.toDate);
    if (params?.status) query.set("status", params.status);
    if (params?.upcoming) query.set("upcoming", "true");
    return request(`/fixtures?${query.toString()}`);
  },
  getFixture(id: number) {
    return request(`/fixtures/${id}`);
  },
  updateFixture(id: number, data: {
    matchType?: string;
    opponent?: string;
    matchDate?: string;
    matchTime?: string;
    venue?: string;
    notes?: string;
    status?: string;
    playerIds?: number[];
    positions?: string[];
    roles?: string[];
    playerNotes?: string[];
  }) {
    return request(`/fixtures/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  deleteFixture(id: number) {
    return request(`/fixtures/${id}`, {
      method: "DELETE"
    });
  },
  getMyFixtures() {
    return request("/fixtures/student/my-fixtures");
  },
  // Videos/Drills endpoints
  getVideos(params?: { category?: string; platform?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.platform) query.set("platform", params.platform);
    return request(`/videos?${query.toString()}`);
  },
  getVideo(id: number) {
    return request(`/videos/${id}`);
  },
  createVideo(data: {
    title: string;
    description?: string;
    videoUrl: string;
    platform?: "YOUTUBE" | "INSTAGRAM";
    category?: string;
    thumbnailUrl?: string;
  }) {
    return request("/videos", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  updateVideo(id: number, data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    platform?: "YOUTUBE" | "INSTAGRAM";
    category?: string;
    thumbnailUrl?: string;
  }) {
    return request(`/videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  deleteVideo(id: number) {
    return request(`/videos/${id}`, {
      method: "DELETE"
    });
  },
  getVideoCategories() {
    return request("/videos/categories/list");
  },
  // Posts endpoints
  getPosts(params?: { centerId?: number }) {
    const query = new URLSearchParams();
    if (params?.centerId) query.set("centerId", params.centerId.toString());
    return request(`/posts?${query.toString()}`);
  },
  getPendingPosts() {
    return request("/posts/pending");
  },
  getPost(id: number) {
    return request(`/posts/${id}`);
  },
  createPost(data: {
    title?: string;
    description?: string;
    mediaType: "IMAGE" | "VIDEO" | "LINK";
    mediaUrl: string;
    centerId?: number;
  }) {
    return request("/posts", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  updatePost(id: number, data: {
    title?: string;
    description?: string;
    mediaType?: "IMAGE" | "VIDEO" | "LINK";
    mediaUrl?: string;
    centerId?: number;
  }) {
    return request(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  approvePost(id: number, status: "APPROVED" | "REJECTED") {
    return request(`/posts/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  },
  deletePost(id: number) {
    return request(`/posts/${id}`, {
      method: "DELETE"
    });
  },
  // Comments endpoints
  getComments(postId: number) {
    return request(`/comments/post/${postId}`);
  },
  createComment(data: {
    postId: number;
    content: string;
  }) {
    return request("/comments", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  updateComment(id: number, content: string) {
    return request(`/comments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ content })
    });
  },
  deleteComment(id: number) {
    return request(`/comments/${id}`, {
      method: "DELETE"
    });
  },
  // Leaderboard endpoints
  getLeaderboard(centerId: number, period?: "all" | "weekly" | "monthly") {
    const query = new URLSearchParams();
    if (period) query.set("period", period);
    return request(`/leaderboard/${centerId}?${query.toString()}`);
  },
  getMyStats() {
    return request("/leaderboard/student/my-stats");
  },
  submitVotes(data: {
    sessionId: number;
    votedForIds: number[];
  }) {
    return request("/leaderboard/vote", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  getSessionStudents(sessionId: number) {
    return request(`/leaderboard/session/${sessionId}/students`);
  },
  checkVoted(sessionId: number) {
    return request(`/leaderboard/session/${sessionId}/voted`);
  }
};

