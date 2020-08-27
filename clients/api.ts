import axios, { AxiosInstance } from "axios";

import { User } from "../interfaces";
import { Image } from "../components/Map";

export class ApiClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(user: User) {
    this.axiosInstance = axios.create({
      baseURL:
        "https://d3svu3nixg.execute-api.us-west-2.amazonaws.com/production",
      headers: { Authorization: user.jwtToken },
    });
  }

  // private async _get(method: "GET" | "POST", url: string): Promise<any> {
  //   // const result = await fetch(url, {
  //   //   method,
  //   //   headers: {
  //   //     ,
  //   //     "Content-Type": "application/json",
  //   //   },
  //   //   cache: "default",
  //   // });
  //   // return result.json();
  //   const result = await axios.get(url);
  // }

  async getImages(): Promise<Image[]> {
    const result = await this.axiosInstance.get("/api/v0/images");

    console.log("33", result);

    return [];
  }

  async presign(): Promise<{
    url: string;
    data: { [key: string]: string };
  }> {
    const formData = new FormData();
    formData.set("latitude", "123");
    formData.set("longitude", "456");
    formData.set("taken_at", "22211");
    formData.set("name", "hey.jpg");
    const result = await this.axiosInstance.post("/api/v0/presign", formData);
    console.log("hi", result);
    return result.data;
  }
}
