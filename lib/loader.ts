import { ApiClient } from "../clients/api";
import { CognitoClient } from "../clients/cognito";
import MapboxClient from "../clients/mapbox";
import { Image, User, ImageAndLocations } from "../interfaces";

const mapbox = new MapboxClient();
const cognitoClient = new CognitoClient();

export async function getInitialData(): Promise<{
  api: ApiClient;
  user: User;
  savedImages: ImageAndLocations[];
}> {
  const user = await cognitoClient.checkForLoggedInUser();
  if (!user) {
    throw new Error("not logged in");
  }
  const api = new ApiClient(user);

  console.log("getInitialData");

  return {
    api,
    user,
    savedImages: await convertImageToImageWithLevels(await api.getImages()),
  };
}

export async function convertImageToImageWithLevels(
  images: Image[]
): Promise<ImageAndLocations[]> {
  return await Promise.all(
    images.map(async (i) => ({
      ...i,
      ...(await mapbox.getStateFromCoordinates({
        latitude: i.coordinates.latitude,
        longitude: i.coordinates.longitude,
      })),
    }))
  );
}
