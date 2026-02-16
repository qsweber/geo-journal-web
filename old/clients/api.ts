import axios, { AxiosInstance } from "axios";

import { Image, ImageAndLocations, User } from "../interfaces";

interface ImageAttributes {
  latitude: number;
  longitude: number;
  name: string;
  takenAt: Date;
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

    return await Promise.all(
      (result.data.images as any[]).map(
        async (image: any): Promise<Image> => {
          const imgBlob = await (
            await fetch(image.presigned_url, { method: "GET" })
          ).blob();

          return {
            coordinates: {
              latitude: parseFloat(image.latitude),
              longitude: parseFloat(image.longitude),
            },
            name: image.name,
            takenAt: new Date(parseInt(image.taken_at) * 1000),
            imgSrc: URL.createObjectURL(imgBlob),
          };
        }
      )
    );
  }

  async saveImage(file: File, image: ImageAttributes): Promise<void> {
    const presignStuff = await this._presign(image);

    const formData = new FormData();
    Object.keys(presignStuff.data).forEach((k) => {
      formData.append(k, presignStuff.data[k]);
    });
    formData.append("file", file);
    await fetch(presignStuff.url, {
      method: "POST",
      body: formData,
    });
  }

  private async _presign(
    image: ImageAttributes
  ): Promise<{
    url: string;
    data: { [key: string]: string };
  }> {
    const formData = new FormData();
    formData.set("latitude", image.latitude.toString());
    formData.set("longitude", image.longitude.toString());
    formData.set(
      "taken_at",
      Math.round(image.takenAt.getTime() / 1000).toString()
    );
    formData.set("name", image.name);
    const result = await this.axiosInstance.post("/api/v0/presign", formData);
    return result.data;
  }

  async deleteImage(image: ImageAndLocations): Promise<void> {
    console.log(`delete ${image.name}`);
  }
}
