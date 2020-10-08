import fetch from "isomorphic-unfetch";

export default class MapboxClient {
  public async getStateFromCoordinates(coordinates: {
    latitude: number;
    longitude: number;
  }): Promise<string> {
    const result = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json?access_token=pk.eyJ1IjoicXN3ZWJlciIsImEiOiJjam5nZTZuazgwMTlkM2twYXpjYmpqeTBjIn0.viU-jQrjmOf40aONFwjQdQ`
    );
    const data = await result.json();
    return this._getStateFromFeatures(data.features);
  }

  _getStateFromFeatures(features: any[]): string {
    for (const feature of features) {
      if (feature.context) {
        for (const context of feature.context) {
          if ((context.id as string).startsWith("region")) {
            return context.text as string;
          }
        }
      }
    }
    throw new Error("no state");
  }
}
