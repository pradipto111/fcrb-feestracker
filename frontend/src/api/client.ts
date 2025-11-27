const API_BASE = "http://localhost:4000";

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
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return null;
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
  }
};

