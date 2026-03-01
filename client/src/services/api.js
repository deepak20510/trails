// Use proxy in dev (Vite proxies /api to backend), or explicit URL in production
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:5000") + "/api/v1";

class ApiService {
  /* ================= CORE REQUEST ================= */

  static async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (options.body instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `Error ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error("API ERROR:", error.message);
      throw error;
    }
  }

  /* ================= AUTH ================= */

  static async signup(userData) {
    const res = await this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    return res;
  }

  static async login(credentials) {
    const res = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    return res;
  }

  static logout() {
    localStorage.clear();
  }

  /* ================= POSTS ================= */

  static async createPost(postData) {
    return this.request("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  }

  static async getPosts(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/posts${params ? `?${params}` : ""}`);
  }

  static async updatePost(postId, postData) {
    return this.request(`/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    });
  }

  static async deletePost(postId) {
    return this.request(`/posts/${postId}`, {
      method: "DELETE",
    });
  }

  static async getMyPosts(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/posts/my-posts${params ? `?${params}` : ""}`);
  }

  /* ================= FILE UPLOAD ================= */
  // For post attachments, profile images, etc. Uses /upload/upload

  static async uploadFile(file, title = "Untitled") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    return this.request("/upload/upload", {
      method: "POST",
      body: formData,
    });
  }

  /* ================= TRAINER ================= */
  // ⚠ Using singular because backend uses /trainer

  static async createTrainerProfile(data) {
    return this.request("/trainer/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async getMyTrainerProfile() {
    return this.request("/trainer/profile");
  }

  static async updateTrainerProfile(data) {
    return this.request("/trainer/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async searchTrainers(filters = {}) {
    // Map frontend filter names to backend query params
    const query = {
      skill: filters.skills || filters.skill,
      location: filters.location,
      minExp: filters.minExperience ?? filters.minExp,
      maxExp: filters.maxExperience ?? filters.maxExp,
      page: filters.page ?? 1,
      limit: filters.limit ?? 12,
      sort: filters.sort ?? "newest",
    };
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(query).filter(([, v]) => v != null && v !== ""),
      ),
    ).toString();
    return this.request(`/trainer/search${params ? `?${params}` : ""}`);
  }

  static async getTrainerProfile(id) {
    return this.request(`/trainer/${id}`);
  }

  /* ================= INSTITUTION ================= */

  static async createInstitutionProfile(data) {
    return this.request("/institution/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async getMyInstitutionProfile() {
    return this.request("/institution/profile");
  }

  static async updateInstitutionProfile(data) {
    return this.request("/institution/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /* ================= REQUESTS ================= */
  // Backend: POST /, PATCH /:id/respond, PATCH /:id/complete

  static async createRequest(data) {
    return this.request("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async respondToRequest(requestId, data) {
    return this.request(`/requests/${requestId}/respond`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async completeRequest(requestId) {
    return this.request(`/requests/${requestId}/complete`, {
      method: "PATCH",
    });
  }

  /* ================= REVIEWS ================= */

  static async createReview(data) {
    return this.request("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /* ================= MATERIAL ================= */
  // Backend: POST /material/upload (multipart), GET /material/:trainerId

  static async getTrainerMaterials(trainerId) {
    return this.request(`/material/${trainerId}`);
  }

  static async uploadMaterial(file, title) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    return this.request("/material/upload", {
      method: "POST",
      body: formData,
    });
  }

  /* ================= MATERIAL RATING ================= */
  // Backend: POST /, PATCH /:ratingId, DELETE /:ratingId, GET /material/:materialId, GET /my-ratings

  static async getMyMaterialRatings() {
    return this.request("/material-rating/my-ratings");
  }

  static async rateMaterial(materialId, rating, comment) {
    return this.request("/material-rating", {
      method: "POST",
      body: JSON.stringify({ materialId, rating, comment }),
    });
  }

  static async updateMaterialRating(ratingId, rating, comment) {
    return this.request(`/material-rating/${ratingId}`, {
      method: "PATCH",
      body: JSON.stringify({ rating, comment }),
    });
  }

  static async deleteMaterialRating(ratingId) {
    return this.request(`/material-rating/${ratingId}`, {
      method: "DELETE",
    });
  }

  static async getMaterialRatings(materialId, query = {}) {
    const params = new URLSearchParams(query).toString();
    return this.request(
      `/material-rating/material/${materialId}${params ? `?${params}` : ""}`,
    );
  }

  /* ================= REPORTS (Admin) ================= */
  // Backend: GET /reports, PATCH /reports/:id, POST /reports/suspend/:userId, POST /reports/unsuspend/:userId

  static async getReports(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/reports${params ? `?${params}` : ""}`);
  }

  static async updateReport(reportId, data) {
    return this.request(`/reports/${reportId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async suspendUser(userId) {
    return this.request(`/reports/suspend/${userId}`, {
      method: "POST",
    });
  }

  static async unsuspendUser(userId) {
    return this.request(`/reports/unsuspend/${userId}`, {
      method: "POST",
    });
  }

  /* ================= OPTIONAL (not in backend - return empty to avoid errors) ================= */

  static async getPopularSkills(limit = 10) {
    try {
      const trainers = await this.searchTrainers({ limit: 50 });
      const skills = new Set();
      (trainers.data || []).forEach((t) =>
        (t.skills || []).forEach((s) => skills.add(s)),
      );
      return { success: true, data: [...skills].slice(0, limit) };
    } catch {
      return { success: true, data: [] };
    }
  }

  static async getPopularLocations(limit = 10) {
    try {
      const trainers = await this.searchTrainers({ limit: 50 });
      const locations = [
        ...new Set(
          (trainers.data || []).map((t) => t.location).filter(Boolean),
        ),
      ];
      return { success: true, data: locations.slice(0, limit) };
    } catch {
      return { success: true, data: [] };
    }
  }
}

export default ApiService;
