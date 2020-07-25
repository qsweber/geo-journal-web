import fetch from "isomorphic-unfetch";

import { User } from "../interfaces";
import { Image } from "../components/Map";

export class ApiClient {
  private readonly user: User;

  constructor(user: User) {
    this.user = user;
  }

  private async _request(method: "GET" | "POST", url: string): Promise<any> {
    const result = await fetch(url, {
      method,
      headers: {
        Authorization: this.user.jwtToken,
        "Content-Type": "application/json",
      },
      cache: "default",
    });
    return result.json();
  }

  async getImages(): Promise<Image[]> {
    const result = await this._request(
      "GET",
      `https://d3svu3nixg.execute-api.us-west-2.amazonaws.com/production/api/v0/user/${this.user.id}`
    );

    console.log(result);

    return [];
  }
}
