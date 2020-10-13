import fetch from "isomorphic-unfetch";
import { ImageLocations } from "../interfaces";

export default class MapboxClient {
  public async getStateFromCoordinates(coordinates: {
    latitude: number;
    longitude: number;
  }): Promise<ImageLocations> {
    const result = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json?access_token=pk.eyJ1IjoicXN3ZWJlciIsImEiOiJjam5nZTZuazgwMTlkM2twYXpjYmpqeTBjIn0.viU-jQrjmOf40aONFwjQdQ`
    );
    const data = await result.json();
    return this._getStateFromFeatures(data.features);
  }

  _getStateFromFeatures(features: any[]): ImageLocations {
    let country: string | undefined;
    let region: string | undefined;
    for (const feature of features) {
      if ((feature.id as string).startsWith("region")) {
        region = feature.text as string;
      } else if ((feature.id as string).startsWith("country")) {
        country = feature.text as string;
      }
    }
    if (!country) {
      throw new Error("no country");
    }

    return { country, region };
  }
}
