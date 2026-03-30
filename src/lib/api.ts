/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ---- Auth ----
  async signup(name: string, email: string, password: string, role: string) {
    return this.request<{ token: string; user: any }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<any>("/api/auth/me");
  }

  // ---- Documents ----
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<any>("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
  }

  async listDocuments() {
    return this.request<{ documents: any[] }>("/api/documents/");
  }

  async getDocument(docId: string) {
    return this.request<any>(`/api/documents/${docId}`);
  }

  async deleteDocument(docId: string) {
    return this.request<any>(`/api/documents/${docId}`, { method: "DELETE" });
  }

  // ---- Analysis ----
  async getFullAnalysis(docId: string) {
    return this.request<any>(`/api/documents/${docId}/analysis/`);
  }

  async getSummary(docId: string) {
    return this.request<any>(`/api/documents/${docId}/analysis/summary`);
  }

  async getConcepts(docId: string) {
    return this.request<any[]>(`/api/documents/${docId}/analysis/concepts`);
  }

  async getBloomTaxonomy(docId: string) {
    return this.request<any[]>(`/api/documents/${docId}/analysis/bloom`);
  }

  async getInsights(docId: string) {
    return this.request<any[]>(`/api/documents/${docId}/analysis/insights`);
  }

  async askQuestion(docId: string, question: string) {
    return this.request<{ question: string; answer: string; sources: string[] }>(
      `/api/documents/${docId}/analysis/qa`,
      {
        method: "POST",
        body: JSON.stringify({ question }),
      }
    );
  }

  async generateQuiz(docId: string, numQuestions: number = 5) {
    return this.request<{ questions: any[] }>(
      `/api/documents/${docId}/analysis/quiz?num_questions=${numQuestions}`,
      { method: "POST" }
    );
  }

  // ---- Health ----
  async healthCheck() {
    return this.request<{ status: string }>("/api/health");
  }

  async llmHealth() {
    return this.request<{ status: string; providers: Record<string, boolean> }>(
      "/api/health/llm"
    );
  }
}

export const api = new ApiClient(API_BASE);
