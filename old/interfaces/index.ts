export interface User {
  id: string;
  email: string;
  jwtToken: string;
}

export interface Image {
  name: string;
  coordinates: { latitude: number; longitude: number };
  imgSrc: string;
  takenAt: Date;
}

export interface ImageLocations {
  country: string;
  region: string | undefined;
}

export interface ImageAndLocations extends Image, ImageLocations {}
