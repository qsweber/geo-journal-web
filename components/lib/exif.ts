import EXIF from "exif-js";

export async function getLatLong(
  file: File
): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, _reject) => {
    EXIF.getData(file as any, function () {
      //@ts-ignore
      const exifData = this.exifdata;
      console.log(exifData);
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

      resolve({ latitude, longitude });
    });
  });
}
