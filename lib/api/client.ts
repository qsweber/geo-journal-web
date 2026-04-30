/**
 * API Client for making authenticated requests to the backend
 */

export interface ApiClientConfig {
  baseUrl: string;
  getIdToken: () => string | null;
}

export class ApiClient {
  private baseUrl: string;
  private getIdToken: () => string | null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.getIdToken = config.getIdToken;
  }

  /**
   * Make an authenticated request to the API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const idToken = this.getIdToken();

    if (!idToken) {
      throw new Error("User is not authenticated");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${idToken}`);

    if (options.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as T;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}
