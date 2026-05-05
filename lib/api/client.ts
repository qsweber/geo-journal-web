/**
 * API Client for making authenticated requests to the backend
 */

export interface ApiClientConfig {
  baseUrl: string;
  getIdToken: () => string | null;
}

// --- Domain types ---

export interface Image {
  name: string;
  latitude: string;
  longitude: string;
  taken_at: string;
  presigned_url: string;
}

export interface ImagesResponse {
  images: Image[];
}

export interface PresignRequest {
  name: string;
  latitude: string;
  longitude: string;
  taken_at: string;
}

export interface PresignData {
  key: string;
  policy: string;
  "x-amz-algorithm": string;
  "x-amz-credential": string;
  "x-amz-date": string;
  "x-amz-signature": string;
  "x-amz-meta-name": string;
  "x-amz-meta-latitude": string;
  "x-amz-meta-longitude": string;
  "x-amz-meta-taken": string;
}

export interface PresignResponse {
  url: string;
  data: PresignData;
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

  // --- Typed domain methods ---

  /** Health check — no authentication required. */
  async getStatus(): Promise<{ text: string }> {
    const url = `${this.baseUrl}/api/v0/status`;
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }
    return response.json();
  }

  /** Returns all images uploaded by the authenticated user. */
  async getImages(): Promise<ImagesResponse> {
    return this.get<ImagesResponse>("/api/v0/images");
  }

  /**
   * Generates a presigned S3 POST form so the client can upload directly to S3.
   * After calling this, POST the file to `response.url` as multipart/form-data,
   * appending all fields from `response.data` before the `file` field.
   */
  async presign(req: PresignRequest): Promise<PresignResponse> {
    return this.request<PresignResponse>("/api/v0/presign", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        name: req.name,
        latitude: req.latitude,
        longitude: req.longitude,
        taken_at: req.taken_at,
      }).toString(),
    });
  }

  /**
   * Convenience method: obtains a presigned S3 POST form and uploads the file
   * directly to S3 in one call.
   */
  async uploadImage(req: PresignRequest, file: File): Promise<void> {
    const { url, data } = await this.presign(req);

    const form = new FormData();
    for (const [key, value] of Object.entries(data)) {
      form.append(key, value);
    }
    form.append("file", file); // must be last per S3 policy

    const response = await fetch(url, { method: "POST", body: form });
    if (!response.ok) {
      throw new Error(
        `S3 upload failed: ${response.status} ${response.statusText}`,
      );
    }
  }
}
