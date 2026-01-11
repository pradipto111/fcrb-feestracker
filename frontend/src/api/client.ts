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
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payloadSize = options.body ? new Blob([options.body as string]).size : 0;
    
    // Log request (non-sensitive data only).
    // Keep console clean by default; enable by setting localStorage.debugApi = "1".
    const shouldLog = import.meta.env.DEV && localStorage.getItem("debugApi") === "1";
    if (shouldLog) {
      console.debug(`[${requestId}] API Request: ${options.method || "GET"} ${url}`, {
        payloadSize: `${payloadSize} bytes`,
        hasAuth: !!currentToken,
      });
    }

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
            // Don't log sensitive data
            if (json.password || json.passwordHash) {
              delete json.password;
              delete json.passwordHash;
            }
          } catch {
            errorMessage = text;
          }
        }
      } catch {
        // If we can't read the error, use status text
      }
      // Don't log 404s as errors - they're expected for missing resources
      if (res.status !== 404) {
        console.error(`[${requestId}] API Error: ${res.status} ${path} - ${errorMessage}`);
      }
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      (error as any).requestId = requestId;
      throw error;
    }

    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return null;
  } catch (error: any) {
    // Don't log 404 errors - they're expected for missing resources
    if (error.status !== 404) {
      console.error(`API Request Failed:`, error);
    }
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
  login(email: string, password: string, role?: "ADMIN" | "COACH" | "STUDENT" | "FAN") {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role })
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

  getPaymentModeBreakdown() {
    return request("/dashboard/payment-mode-breakdown");
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
  getStudentTimeline() {
    return request("/student/timeline");
  },
  // Monthly Feedback endpoints
  getMyFeedback() {
    return request("/feedback/student/my-feedback");
  },
  // Wellness Check endpoints
  submitWellnessCheck(data: {
    sessionId?: number;
    exertionLevel: number;
    muscleSoreness?: number;
    energyLevel: "LOW" | "MEDIUM" | "HIGH";
    comment?: string;
  }) {
    return request("/wellness/check", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getMyWellnessChecks(days?: number) {
    const query = days ? `?days=${days}` : "";
    return request(`/wellness/student/my-checks${query}`);
  },
  // Match Selection endpoints
  getMyMatchSelections() {
    return request("/match-selection/student/my-selections");
  },
  // Progress Roadmap endpoints
  getMyProgressRoadmap() {
    return request("/progress-roadmap/student/my-roadmap");
  },
  // Admin - Center management
  // Public: Get active centres for homepage map
  getPublicCentres() {
    return request("/centers/public");
  },
  // Authenticated: Get centres (admin/coach)
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
  updateCenter(id: number, data: any) {
    return request(`/centers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  deleteCenter(id: number) {
    return request(`/centers/${id}`, {
      method: "DELETE"
    });
  },
  // Centre Metrics
  getCentreMetrics(centreId: number, params?: { from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    return request(`/centers/${centreId}/metrics?${query.toString()}`);
  },
  saveCentreMetrics(centreId: number, data: any) {
    return request(`/centers/${centreId}/metrics`, {
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
  createCoach(data: { fullName: string; email: string; password: string; phoneNumber?: string; centerIds?: number[] }) {
    return request("/coaches", {
      method: "POST",
      body: JSON.stringify(data)
    });
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
  getAttendanceAnalytics(params?: { centreId?: number; month?: number; year?: number }) {
    const query = new URLSearchParams();
    if (params?.centreId) query.set("centreId", params.centreId.toString());
    if (params?.month) query.set("month", params.month.toString());
    if (params?.year) query.set("year", params.year.toString());
    return request(`/attendance/analytics?${query.toString()}`);
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
    status?: string;
    score?: string;
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
  // Public fixtures for landing page (no auth required)
  getPublicFixtures() {
    return fetch(`${API_BASE}/fixtures/public`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      mode: 'cors',
    }).then(res => {
      if (!res.ok) throw new Error("Failed to fetch fixtures");
      return res.json();
    });
  },
  // Club Calendar / Events (public read + admin/coach CRUD)
  getEvents(params?: { from?: string; to?: string; type?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    if (params?.type) query.set("type", params.type);
    const qs = query.toString();
    return request(`/events${qs ? `?${qs}` : ""}`);
  },
createEvent(data: {
    type: string;
    title: string;
    startAt: string;
    endAt?: string | null;
    allDay?: boolean;
    venueName?: string | null;
    venueAddress?: string | null;
    googleMapsUrl?: string | null;
    competition?: string | null;
    opponent?: string | null;
    homeAway?: "HOME" | "AWAY" | null;
    teamId?: number | null;
    centerId?: number | null;
    status?: string;
    notes?: string | null;
    playerIds?: number[];
    positions?: string[];
    roles?: string[];
    playerNotes?: string[];
  }) {
return request("/events", { method: "POST", body: JSON.stringify(data) });
  },
  updateEvent(id: string, data: Partial<{
    type: string;
    title: string;
    startAt: string;
    endAt: string | null;
    allDay: boolean;
    venueName: string | null;
    venueAddress: string | null;
    googleMapsUrl: string | null;
    competition: string | null;
    opponent: string | null;
    homeAway: "HOME" | "AWAY" | null;
    teamId: number | null;
    centerId: number | null;
    status: string;
    notes: string | null;
    playerIds: number[];
    positions: string[];
    roles: string[];
    playerNotes: string[];
  }>) {
    return request(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },
  deleteEvent(id: string) {
    return request(`/events/${id}`, { method: "DELETE" });
  },
  seedDemoEvents() {
    return request("/events/seed", { method: "POST" });
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
    score?: string;
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
  },
  // Website Leads endpoints
  createWebsiteLead(data: {
    playerName: string;
    playerDob?: string | null;
    ageBracket?: string | null;
    guardianName: string;
    phone: string;
    email: string;
    preferredCentre: string;
    programmeInterest: string;
    playingPosition?: string | null;
    currentLevel: string;
    heardFrom: string;
    notes?: string | null;
  }) {
    return request("/leads", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  getLeads(params?: { status?: string; centre?: string; programme?: string; fromDate?: string; toDate?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.centre) query.set("centre", params.centre);
    if (params?.programme) query.set("programme", params.programme);
    if (params?.fromDate) query.set("fromDate", params.fromDate);
    if (params?.toDate) query.set("toDate", params.toDate);
    return request(`/leads?${query.toString()}`);
  },
  getLead(id: number) {
    return request(`/leads/${id}`);
  },
  updateLead(id: number, data: {
    status?: string;
    assignedTo?: number | null;
    internalNotes?: string | null;
  }) {
    return request(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  convertLeadToPlayer(leadId: number) {
    return request(`/leads/${leadId}/convert`, {
      method: "POST"
    });
  },
  // Legacy Leads endpoints
  createLegacyLead(data: {
    name: string;
    phone: string;
    age: number;
    heightCmInput: number;
    weightKgInput: number;
    heightCmBucket: number;
    weightKgBucket: number;
    matchedPlayerId: string;
    matchedPlayerName: string;
    matchedPlayerPosition: string;
    matchedPlayerArchetype: string | string[]; // Can be string or array
    matchedPlayerLegacy: any;
    consent: boolean;
  }) {
    return request("/legacy", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  getLegacyLeads(params?: { status?: string; fromDate?: string; toDate?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.fromDate) query.set("fromDate", params.fromDate);
    if (params?.toDate) query.set("toDate", params.toDate);
    if (params?.search) query.set("search", params.search);
    return request(`/legacy?${query.toString()}`);
  },
  getLegacyLead(id: number) {
    return request(`/legacy/${id}`);
  },
  updateLegacyLead(id: number, data: {
    status?: string;
    notes?: string | null;
  }) {
    return request(`/legacy/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  async exportLegacyLeadsCSV(params?: { status?: string; fromDate?: string; toDate?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.fromDate) query.set("fromDate", params.fromDate);
    if (params?.toDate) query.set("toDate", params.toDate);
    
    const currentToken = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (currentToken) headers["Authorization"] = `Bearer ${currentToken}`;
    
    const url = `${API_BASE}/legacy/export/csv?${query.toString()}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
    return await res.blob();
  },
  // Shop endpoints
  getProducts() {
    return request("/shop/products");
  },
  getProduct(slug: string) {
    return request(`/shop/products/${slug}`);
  },
  createOrder(data: {
    items: Array<{ productId: number; quantity: number; variant?: string; size?: string }>;
    customerName: string;
    phone: string;
    email: string;
    shippingAddress: any;
  }) {
    return request("/shop/orders/create", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  verifyPayment(orderId: number, data: { paymentId: string; signature: string; razorpayOrderId: string }) {
    return request(`/shop/orders/${orderId}/verify`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  getOrder(orderNumber: string) {
    return request(`/shop/orders/${orderNumber}`);
  },
  // Admin merchandise endpoints
  getAdminProducts(params?: { category?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    return request(`/admin/merch?${query.toString()}`);
  },
  getAdminProduct(id: number) {
    return request(`/admin/merch/${id}`);
  },
  createProduct(data: {
    name: string;
    slug: string;
    description?: string;
    images: string[];
    price: number;
    currency?: string;
    sizes?: string[];
    variants?: any;
    stock?: number | null;
    category?: string;
    tags?: string[];
    displayOrder?: number;
    isActive?: boolean;
  }) {
    return request("/admin/merch", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  updateProduct(id: number, data: {
    name?: string;
    slug?: string;
    description?: string;
    images?: string[];
    price?: number;
    currency?: string;
    sizes?: string[];
    variants?: any;
    stock?: number | null;
    category?: string;
    tags?: string[];
    displayOrder?: number;
    isActive?: boolean;
  }) {
    return request(`/admin/merch/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  deleteProduct(id: number) {
    return request(`/admin/merch/${id}`, {
      method: "DELETE"
    });
  },
  getProductCategories() {
    return request("/admin/merch/categories");
  },

  // Analytics APIs
  // Admin Analytics
  getAdminAnalyticsSummary(params?: { centerId?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (params?.centerId) query.append("centerId", params.centerId);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    return request(`/analytics/admin/summary?${query.toString()}`);
  },
  getAdminAttendanceAnalytics(params?: { centerId?: string; groupBy?: "week" | "month" }) {
    const query = new URLSearchParams();
    if (params?.centerId) query.append("centerId", params.centerId);
    if (params?.groupBy) query.append("groupBy", params.groupBy);
    return request(`/analytics/admin/attendance?${query.toString()}`);
  },
  getAdminAttendanceByCentre() {
    return request("/analytics/admin/attendance-by-centre");
  },
  getAdminPipeline() {
    return request("/analytics/admin/pipeline");
  },
  getAdminFinance(params?: { months?: string }) {
    const query = new URLSearchParams();
    if (params?.months) query.append("months", params.months);
    return request(`/analytics/admin/finance?${query.toString()}`);
  },
  getAdminSessions(params?: { centerId?: string }) {
    const query = new URLSearchParams();
    if (params?.centerId) query.append("centerId", params.centerId);
    return request(`/analytics/admin/sessions?${query.toString()}`);
  },
  getAdminMatches() {
    return request("/analytics/admin/matches");
  },

  // Coach Analytics
  getCoachAnalyticsSummary() {
    return request("/analytics/coach/summary");
  },
  getCoachPlayerEngagement() {
    return request("/analytics/coach/player-engagement");
  },
  getCoachWellness() {
    return request("/analytics/coach/wellness");
  },
  getCoachFeedbackQueue() {
    return request("/analytics/coach/feedback-queue");
  },

  // Player Analytics
  getPlayerAnalyticsSummary() {
    return request("/analytics/player/summary");
  },
  getPlayerAttendance() {
    return request("/analytics/player/attendance");
  },
  getPlayerWellness(params?: { weeks?: string }) {
    const query = new URLSearchParams();
    if (params?.weeks) query.append("weeks", params.weeks);
    return request(`/analytics/player/wellness?${query.toString()}`);
  },
  getPlayerMatches() {
    return request("/analytics/player/matches");
  },
  getPlayerProgress() {
    return request("/analytics/player/progress");
  },
  // New Analytics Endpoints
  getAnalyticsOverview(params?: { from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    return request(`/analytics/overview?${query.toString()}`);
  },
  getAnalyticsCentres(params?: { from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    return request(`/analytics/centres?${query.toString()}`);
  },
  getCentreAnalytics(centreId: number, params?: { from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    return request(`/analytics/centres/${centreId}?${query.toString()}`);
  },
  // Fan Club Analytics
  getFanClubAnalytics() {
    return request("/fan-admin/analytics/summary");
  },
  // Shop Analytics
  getShopAnalytics(params?: { from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    return request(`/admin/shop/analytics?${query.toString()}`);
  },
  getCentreAttendanceBreakdown(centreId: number, params?: { from?: string; to?: string; groupBy?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    if (params?.groupBy) query.set("groupBy", params.groupBy);
    return request(`/analytics/centres/${centreId}/attendance-breakdown?${query.toString()}`);
  },
  getCentrePaymentsBreakdown(centreId: number, params?: { from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    return request(`/analytics/centres/${centreId}/payments-breakdown?${query.toString()}`);
  },
  getCentreTrialsBreakdown(centreId: number, params?: { from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    return request(`/analytics/centres/${centreId}/trials-breakdown?${query.toString()}`);
  },
  // Player Metrics API
  getMyLatestMetricSnapshot() {
    return request("/player-metrics/snapshots/my/latest");
  },
  getMyMetricSnapshots(params?: { limit?: number; offset?: number; sourceContext?: string }) {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());
    if (params?.sourceContext) query.set("sourceContext", params.sourceContext);
    return request(`/player-metrics/snapshots/my?${query.toString()}`);
  },
  getMyMetricTimeline(metricKey: string, limit?: number) {
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit.toString());
    return request(`/player-metrics/timeline/my/${metricKey}?${query.toString()}`);
  },
  getMyPositionalSuitability() {
    return request("/player-metrics/positional/my");
  },
  getMetricDefinitions() {
    return request("/player-metrics/definitions");
  },
  getStudentSnapshots(studentId: number, params?: { limit?: number; offset?: number; sourceContext?: string }) {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());
    if (params?.sourceContext) query.set("sourceContext", params.sourceContext);
    return request(`/player-metrics/snapshots/${studentId}?${query.toString()}`);
  },
  getMyCoachNotes(limit?: number) {
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit.toString());
    return request(`/player-metrics/notes/my?${query.toString()}`);
  },
  // Admin/Coach endpoints for viewing student metrics
  getStudentMetricSnapshot(studentId: number) {
    return request(`/player-metrics/snapshots/${studentId}/latest`);
  },
  getStudentPositionalSuitability(studentId: number) {
    return request(`/player-metrics/positional/${studentId}`);
  },
  // Coach Calibration APIs
  getCoachScoringProfile(coachId: number, refresh?: boolean) {
    const query = refresh ? '?refresh=true' : '';
    return request(`/player-metrics/calibration/profile/${coachId}${query}`);
  },
  getAllCoachProfiles() {
    return request('/player-metrics/calibration/profiles/all');
  },
  getContextualAverages(metricKey: string, filters?: {
    centerId?: number;
    position?: string;
    ageGroup?: string;
    seasonId?: string;
  }) {
    const query = new URLSearchParams();
    if (filters?.centerId) query.set('centerId', filters.centerId.toString());
    if (filters?.position) query.set('position', filters.position);
    if (filters?.ageGroup) query.set('ageGroup', filters.ageGroup);
    if (filters?.seasonId) query.set('seasonId', filters.seasonId);
    return request(`/player-metrics/calibration/averages/${metricKey}?${query.toString()}`);
  },
  getCalibrationHints(payload: {
    metricKey: string;
    value: number;
    studentId?: number;
    centerId?: number;
    position?: string;
    ageGroup?: string;
  }) {
    return request('/player-metrics/calibration/hints', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  refreshCoachProfile(coachId: number) {
    return request(`/player-metrics/calibration/profile/${coachId}/refresh`, {
      method: 'POST',
    });
  },
  // Multi-Coach Consensus APIs (admin only)
  getPlayerConsensus(studentId: number, anonymize: boolean = true) {
    return request(`/player-metrics/calibration/consensus/player/${studentId}?anonymize=${anonymize}`);
  },
  getMultiCoachPlayers(minCoaches: number = 2) {
    return request(`/player-metrics/calibration/consensus/players?minCoaches=${minCoaches}`);
  },
  // Create player metric snapshot (COACH/ADMIN only)
  createPlayerMetricSnapshot(payload: {
    studentId: number;
    sourceContext: string;
    notes?: string;
    values: Array<{ metricKey: string; valueNumber: number; comment?: string }>;
    positional?: Array<{ position: string; suitability: number; comment?: string }>;
    traits?: Array<{ traitKey: string; score: number }>;
  }) {
    return request("/player-metrics/snapshots", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  // Scouting & Comparison APIs
  comparePlayers(payload: {
    playerIds: number[];
    position: string;
    ageGroup?: string;
    level?: string;
    snapshotType: 'latest' | 'specific' | 'average';
    snapshotDate?: string;
    averageSnapshots?: number;
  }) {
    return request("/scouting/compare", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getPlayersForScouting(params?: {
    centerId?: number;
    position?: string;
    ageGroup?: string;
    level?: string;
    readinessMin?: number;
    readinessMax?: number;
    trendDirection?: 'improving' | 'plateau' | 'declining';
    injuryRisk?: boolean;
    coachConfidence?: number;
    lastUpdatedDays?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.centerId) query.set("centerId", params.centerId.toString());
    if (params?.position) query.set("position", params.position);
    if (params?.ageGroup) query.set("ageGroup", params.ageGroup);
    if (params?.level) query.set("level", params.level);
    if (params?.readinessMin) query.set("readinessMin", params.readinessMin.toString());
    if (params?.readinessMax) query.set("readinessMax", params.readinessMax.toString());
    if (params?.trendDirection) query.set("trendDirection", params.trendDirection);
    if (params?.injuryRisk) query.set("injuryRisk", "true");
    if (params?.coachConfidence) query.set("coachConfidence", params.coachConfidence.toString());
    if (params?.lastUpdatedDays) query.set("lastUpdatedDays", params.lastUpdatedDays.toString());
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());
    return request(`/scouting/players?${query.toString()}`);
  },
  getScoutingBoards() {
    return request("/scouting/boards");
  },
  createScoutingBoard(payload: {
    name: string;
    description?: string;
    type: 'CENTRE_VIEW' | 'CLUB_WIDE' | 'CUSTOM';
    centerId?: number;
  }) {
    return request("/scouting/boards", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getScoutingBoard(boardId: number) {
    return request(`/scouting/boards/${boardId}`);
  },
  updateScoutingBoard(boardId: number, payload: { name?: string; description?: string }) {
    return request(`/scouting/boards/${boardId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteScoutingBoard(boardId: number) {
    return request(`/scouting/boards/${boardId}`, {
      method: "DELETE",
    });
  },
  addPlayerToBoard(boardId: number, payload: { studentId: number; notes?: string }) {
    return request(`/scouting/boards/${boardId}/players`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  removePlayerFromBoard(boardId: number, studentId: number) {
    return request(`/scouting/boards/${boardId}/players/${studentId}`, {
      method: "DELETE",
    });
  },
  getBoardPlayers(boardId: number) {
    return request(`/scouting/boards/${boardId}/players`);
  },
  createScoutingDecision(boardId: number, payload: {
    studentId: number;
    decisionState: 'OBSERVING' | 'TRIAL_RECOMMENDED' | 'READY_FOR_PROMOTION' | 'HOLD_FOR_DEVELOPMENT' | 'INTERVENTION_NEEDED';
    notes?: string;
  }) {
    return request(`/scouting/boards/${boardId}/decisions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getScoutingDecisions(boardId: number) {
    return request(`/scouting/boards/${boardId}/decisions`);
  },
  // Parent Development Reports APIs
  generateReportContent(payload: {
    studentId: number;
    snapshotId: number;
    reportingPeriodStart?: string;
    reportingPeriodEnd?: string;
    coachNote?: string;
  }) {
    return request("/parent-reports/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createParentReport(payload: {
    studentId: number;
    snapshotId: number;
    reportingPeriodStart?: string;
    reportingPeriodEnd?: string;
    coachNote?: string;
  }) {
    return request("/parent-reports", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getMyReports() {
    return request("/parent-reports/my");
  },
  getStudentReports(studentId: number, includeDrafts?: boolean) {
    const query = includeDrafts ? "?includeDrafts=true" : "";
    return request(`/parent-reports/student/${studentId}${query}`);
  },
  getReport(reportId: number) {
    return request(`/parent-reports/${reportId}`);
  },
  updateReport(reportId: number, payload: {
    reportingPeriodStart?: string;
    reportingPeriodEnd?: string;
    coachNote?: string;
  }) {
    return request(`/parent-reports/${reportId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  publishReport(reportId: number, visibleToParent?: boolean) {
    return request(`/parent-reports/${reportId}/publish`, {
      method: "POST",
      body: JSON.stringify({ visibleToParent: visibleToParent !== false }),
    });
  },
  deleteReport(reportId: number) {
    return request(`/parent-reports/${reportId}`, {
      method: "DELETE",
    });
  },
  // Season Planning & Load Prediction APIs
  getSeasonPlans(centerId?: number) {
    const query = new URLSearchParams();
    if (centerId) query.set("centerId", centerId.toString());
    return request(`/season-planning/plans?${query.toString()}`);
  },
  getSeasonPlan(id: number) {
    return request(`/season-planning/plans/${id}`);
  },
  createSeasonPlan(data: {
    centerId: number;
    name: string;
    seasonStart: string;
    seasonEnd: string;
    description?: string;
    phases?: Array<{
      name: string;
      phaseType: string;
      startDate: string;
      endDate: string;
      description?: string;
      targetLoadRange?: { min: number; max: number };
    }>;
  }) {
    return request("/season-planning/plans", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateSeasonPlan(id: number, data: any) {
    return request(`/season-planning/plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteSeasonPlan(id: number) {
    return request(`/season-planning/plans/${id}`, {
      method: "DELETE",
    });
  },
  createSessionLoad(sessionId: number, data: {
    intensity: "LOW" | "MEDIUM" | "HIGH";
    duration: number;
    focusTags: string[];
    notes?: string;
    seasonPlanId?: number;
  }) {
    return request(`/season-planning/sessions/${sessionId}/load`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getSessionLoad(sessionId: number) {
    return request(`/season-planning/sessions/${sessionId}/load`);
  },
  getPlayerLoadTrends(studentId: number, weeks?: number) {
    const query = new URLSearchParams();
    if (weeks) query.set("weeks", weeks.toString());
    return request(`/season-planning/players/${studentId}/load-trends?${query.toString()}`);
  },
  getPlayerWeeklyLoad(studentId: number, weekStart?: string) {
    const query = new URLSearchParams();
    if (weekStart) query.set("weekStart", weekStart);
    return request(`/season-planning/players/${studentId}/weekly-load?${query.toString()}`);
  },
  getReadinessLoadCorrelation(studentId: number, weeks?: number) {
    const query = new URLSearchParams();
    if (weeks) query.set("weeks", weeks.toString());
    return request(`/season-planning/players/${studentId}/readiness-load-correlation?${query.toString()}`);
  },
  createDevelopmentBlock(planId: number, data: {
    name: string;
    startDate: string;
    endDate: string;
    focusArea: string;
    targetMetrics?: string[];
    suggestedLoadRange?: { min: number; max: number };
    sessionFocusDistribution?: Record<string, number>;
    description?: string;
  }) {
    return request(`/season-planning/plans/${planId}/development-blocks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getPlayerWorkloadMessage(studentId: number) {
    return request(`/season-planning/players/${studentId}/workload-message`);
  },

  // Fan Club (RealVerse Fan)
  getFanMe() {
    return request("/fan/me");
  },
  getFanOnboarding() {
    return request("/fan/onboarding");
  },
  submitFanOnboarding(payload: { persona?: string; favoritePlayer?: string; locality?: string; goals?: string[] }) {
    return request("/fan/onboarding", { method: "POST", body: JSON.stringify(payload) });
  },
  getFanTiers() {
    return request("/fan/tiers");
  },
  getFanSponsors() {
    return request("/fan/sponsors");
  },
  getFanMatchdayMoments() {
    return request("/fan/matchday/moments");
  },
  getFanDynamicRewards() {
    return request("/fan/dynamic-rewards");
  },
  getFanRewards() {
    return request("/fan/rewards");
  },
  getFanCoupons() {
    return request("/fan/coupons");
  },
  getFanQuests() {
    return request("/fan/quests");
  },
  getFanHistory() {
    return request("/fan/history");
  },
  redeemFanCoupon(couponPoolId: number) {
    return request("/fan/redeem", { method: "POST", body: JSON.stringify({ couponPoolId }) });
  },
  submitFanGameSession(payload: { gameType: string; input?: any; result?: any; pointsEarned?: number }) {
    return request("/fan/game/session", { method: "POST", body: JSON.stringify(payload) });
  },
  submitFanProgramInterest(payload: { programInterest: "EPP" | "SCP" | "WPP" | "FYDP"; notes?: string }) {
    return request("/fan/program-interest", { method: "POST", body: JSON.stringify(payload) });
  },

  // Admin Fan Club control plane (read-only / CRUD)
  adminGetFans() {
    return request("/api/admin/fans");
  },
  adminCreateFan(payload: { email: string; fullName: string; phone?: string; city?: string; centerPreference?: string; tierId?: number | null; password?: string }) {
    return request("/api/admin/fans", { method: "POST", body: JSON.stringify(payload) });
  },
  adminUpdateFanStatus(fanUserId: number, status: "ACTIVE" | "SUSPENDED") {
    return request(`/api/admin/fans/${fanUserId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  },
  adminAssignFanTier(fanUserId: number, tierId: number | null) {
    return request(`/api/admin/fans/${fanUserId}/tier`, { method: "PATCH", body: JSON.stringify({ tierId }) });
  },
  adminAdjustFanPoints(fanUserId: number, payload: { delta: number; reason?: string }) {
    return request(`/api/admin/fans/${fanUserId}/points`, { method: "POST", body: JSON.stringify(payload) });
  },
  adminAssignFanBadge(fanUserId: number, payload: { badgeKey: string; badgeName?: string; source?: string }) {
    return request(`/api/admin/fans/${fanUserId}/badges`, { method: "POST", body: JSON.stringify(payload) });
  },
  adminResetFanPassword(fanUserId: number, password?: string) {
    return request(`/api/admin/fans/${fanUserId}/reset-password`, { method: "POST", body: JSON.stringify({ password }) });
  },
  adminGetFanTiers() {
    return request("/api/admin/fans/tiers");
  },
  adminCreateFanTier(payload: any) {
    return request("/api/admin/fans/tiers", { method: "POST", body: JSON.stringify(payload) });
  },
  adminUpdateFanTier(tierId: number, payload: any) {
    return request(`/api/admin/fans/tiers/${tierId}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  adminGetFanSponsors() {
    return request("/api/admin/fans/sponsors");
  },
  adminCreateFanSponsor(payload: any) {
    return request("/api/admin/fans/sponsors", { method: "POST", body: JSON.stringify(payload) });
  },
  adminGetFanCampaigns() {
    return request("/api/admin/fans/campaigns");
  },
  adminCreateFanCampaign(payload: any) {
    return request("/api/admin/fans/campaigns", { method: "POST", body: JSON.stringify(payload) });
  },
  adminGetFanCouponPools() {
    return request("/api/admin/fans/coupon-pools");
  },
  adminCreateFanCouponPool(payload: any) {
    return request("/api/admin/fans/coupon-pools", { method: "POST", body: JSON.stringify(payload) });
  },
  adminGetFanQuests() {
    return request("/api/admin/fans/quests");
  },
  adminCreateFanQuest(payload: any) {
    return request("/api/admin/fans/quests", { method: "POST", body: JSON.stringify(payload) });
  },
  adminGetFanAnalyticsSummary() {
    return request("/api/admin/fans/analytics/summary");
  },
  adminGetFanRedemptions() {
    return request("/api/admin/fans/redemptions");
  },
  adminGetFanLeads() {
    return request("/api/admin/fans/leads");
  },
  adminGetFanAuditLogs() {
    return request("/api/admin/fans/audit");
  },
  adminGetFanMatchdayMoments() {
    return request("/api/admin/fans/moments");
  },
  adminCreateFanMatchdayMoment(payload: any) {
    return request("/api/admin/fans/moments", { method: "POST", body: JSON.stringify(payload) });
  },
  adminUpdateFanMatchdayMoment(momentId: number, payload: any) {
    return request(`/api/admin/fans/moments/${momentId}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  adminGetDynamicRewardRules() {
    return request("/api/admin/fans/dynamic-rewards");
  },
  adminCreateDynamicRewardRule(payload: any) {
    return request("/api/admin/fans/dynamic-rewards", { method: "POST", body: JSON.stringify(payload) });
  },
  adminUpdateDynamicRewardRule(ruleId: number, payload: any) {
    return request(`/api/admin/fans/dynamic-rewards/${ruleId}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  // Trial Management APIs
  getTrialEvents(params?: { centerId?: number; status?: string; coachId?: number }) {
    const query = new URLSearchParams();
    if (params?.centerId) query.set("centerId", params.centerId.toString());
    if (params?.status) query.set("status", params.status);
    if (params?.coachId) query.set("coachId", params.coachId.toString());
    return request(`/trials/events?${query.toString()}`);
  },
  createTrialEvent(payload: {
    title: string;
    centerId: number;
    startDateTime: string;
    endDateTime: string;
    ageGroups: string[];
    positionsNeeded: string[];
    format?: string;
    notes?: string;
    staffIds?: number[];
  }) {
    return request("/trials/events", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getTrialEvent(eventId: number) {
    return request(`/trials/events/${eventId}`);
  },
  updateTrialEvent(eventId: number, payload: any) {
    return request(`/trials/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  addStaffToEvent(eventId: number, payload: { coachId: number; role?: string }) {
    return request(`/trials/events/${eventId}/staff`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  removeStaffFromEvent(eventId: number, coachId: number) {
    return request(`/trials/events/${eventId}/staff/${coachId}`, {
      method: "DELETE",
    });
  },
  getTrialists(params?: { search?: string; primaryPosition?: string; ageGroup?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.primaryPosition) query.set("primaryPosition", params.primaryPosition);
    if (params?.ageGroup) query.set("ageGroup", params.ageGroup);
    return request(`/trials/trialists?${query.toString()}`);
  },
  createTrialist(payload: any) {
    return request("/trials/trialists", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getTrialist(trialistId: number) {
    return request(`/trials/trialists/${trialistId}`);
  },
  updateTrialist(trialistId: number, payload: any) {
    return request(`/trials/trialists/${trialistId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  addTrialistToEvent(eventId: number, payload: { trialistId: number; notes?: string }) {
    return request(`/trials/events/${eventId}/trialists`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  removeTrialistFromEvent(eventId: number, trialistId: number) {
    return request(`/trials/events/${eventId}/trialists/${trialistId}`, {
      method: "DELETE",
    });
  },
  getTrialTemplates(params?: { positionScope?: string; position?: string; ageGroup?: string }) {
    const query = new URLSearchParams();
    if (params?.positionScope) query.set("positionScope", params.positionScope);
    if (params?.position) query.set("position", params.position);
    if (params?.ageGroup) query.set("ageGroup", params.ageGroup);
    return request(`/trials/templates?${query.toString()}`);
  },
  createTrialTemplate(payload: any) {
    return request("/trials/templates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getTrialTemplate(templateId: number) {
    return request(`/trials/templates/${templateId}`);
  },
  updateTrialTemplate(templateId: number, payload: any) {
    return request(`/trials/templates/${templateId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  getTrialReports(params?: {
    trialEventId?: number;
    trialistId?: number;
    coachId?: number;
    position?: string;
    ageGroup?: string;
    recommendedAction?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.trialEventId) query.set("trialEventId", params.trialEventId.toString());
    if (params?.trialistId) query.set("trialistId", params.trialistId.toString());
    if (params?.coachId) query.set("coachId", params.coachId.toString());
    if (params?.position) query.set("position", params.position);
    if (params?.ageGroup) query.set("ageGroup", params.ageGroup);
    if (params?.recommendedAction) query.set("recommendedAction", params.recommendedAction);
    return request(`/trials/reports?${query.toString()}`);
  },
  createTrialReport(payload: any) {
    return request("/trials/reports", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getTrialReport(reportId: number) {
    return request(`/trials/reports/${reportId}`);
  },
  updateTrialReport(reportId: number, payload: any) {
    return request(`/trials/reports/${reportId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  compareTrialists(payload: {
    trialistIds: number[];
    trialEventId?: number;
    position: string;
    ageGroup: string;
  }) {
    return request("/trials/compare", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createTrialShortlist(payload: {
    trialEventId: number;
    name: string;
    description?: string;
  }) {
    return request("/trials/shortlists", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  addTrialistToShortlist(shortlistId: number, payload: { trialistId: number; notes?: string }) {
    return request(`/trials/shortlists/${shortlistId}/trialists`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  removeTrialistFromShortlist(shortlistId: number, trialistId: number) {
    return request(`/trials/shortlists/${shortlistId}/trialists/${trialistId}`, {
      method: "DELETE",
    });
  },
  createTrialDecision(payload: {
    trialEventId: number;
    trialistId: number;
    decision: string;
    notes?: string;
  }) {
    return request("/trials/decisions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

