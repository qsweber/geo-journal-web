import EXIF from "exif-js";
import { findEXIFinHEIC } from "./exif_heic";

export async function getLatLong(
  file: File
): Promise<{ latitude: number; longitude: number }> {
  let exifData: Record<string, any>;
  try {
    exifData = await getExif(file);
  } catch (error) {
    exifData = findEXIFinHEIC(await file.arrayBuffer());
  }

  const latitudeComponents: number[] = exifData.GPSLatitude;
  const latitudeRef: "N" | "S" = exifData.GPSLatitudeRef;
  const longitudeComponents: number[] = exifData.GPSLongitude;
  const longitudeRef: "E" | "W" = exifData.GPSLongitudeRef;

  const latitude =
    (latitudeRef === "N" ? 1 : -1) *
    latitudeComponents.reduce((total, value, index) => {
      return total + value / Math.pow(60, index);
    }, 0);

  const longitude =
    (longitudeRef === "E" ? 1 : -1) *
    longitudeComponents.reduce((total, value, index) => {
      return total + value / Math.pow(60, index);
    }, 0);

  return { latitude, longitude };
}

async function getExif(file: File): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    EXIF.getData(file as any, async function () {
      // @ts-ignore
      const exifData = this.exifdata;
      console.log(exifData);
      if (!exifData.GPSLatitude) {
        reject(new Error("nope"));
      }
      resolve(exifData);
    });
  });
}
