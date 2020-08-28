import axios, { AxiosInstance } from "axios";

import { User } from "../interfaces";

export interface ImageMetadata {
  latitude: number;
  longitude: number;
  name: string;
  takenAt: Date;
}

export interface Image {
  metadata: ImageMetadata;
  presignedUrl: string;
}

export class ApiClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(user: User) {
    this.axiosInstance = axios.create({
      baseURL:
        "https://d3svu3nixg.execute-api.us-west-2.amazonaws.com/production",
      headers: { Authorization: user.jwtToken },
    });
  }

  async getImages(): Promise<Image[]> {
    const result = await this.axiosInstance.get("/api/v0/images");

    console.log("33", result);

    return (result.data.images as any[]).map((image: any): Image => {
      return {
        metadata: {
          latitude: parseFloat(image['latitude']),
          longitude: parseFloat(image['longitude']),
          name: image['name'],
          takenAt: new Date(parseInt(image['taken_at']) * 1000)
        },
        presignedUrl: image['presigned_url'],
      }
    });
  }

  async presign(image: ImageMetadata): Promise<{
    url: string;
    data: { [key: string]: string };
  }> {
    const formData = new FormData();
    formData.set("latitude", image.latitude.toString());
    formData.set("longitude", image.longitude.toString());
    formData.set("taken_at", Math.round(image.takenAt.getTime() / 1000).toString());
    formData.set("name", image.name);
    const result = await this.axiosInstance.post("/api/v0/presign", formData);
    return result.data;
  }
}
