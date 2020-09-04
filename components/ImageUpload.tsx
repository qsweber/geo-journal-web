import React from "react";

import { User } from "../interfaces";
import { Image } from "./Map";
import { ApiClient, ImageMetadata } from "../clients/api";
import MapboxClient from "../clients/mapbox";
import { getLatLong } from "../lib/exif";

interface Props {
  loggedInUser: User | undefined;
  api: ApiClient | undefined;
  mapbox: MapboxClient;
  callback: (newImages: Image[]) => void;
}

const ImageUpload = (props: Props) => {
  return (
    <input
      type="file"
      multiple
      onChange={async (event) => {
        const fileList = event.target.files;
        if (!fileList) {
          return;
        }

        const newImages: Image[] = [];
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList.item(i);
          if (file) {
            const image = await getImageFromUploadedFile(props.mapbox, file);
            newImages.push(image);
            if (props.api) {
              await saveImage(file, image, props.api);
            }
          }
        }
        props.callback(newImages);
      }}
    />
  );
};

async function getImageFromUploadedFile(
  mapbox: MapboxClient,
  file: File
): Promise<Image> {
  const coordinates = await getLatLong(file);
  return {
    stateName: await mapbox.getStateFromCoordinates(coordinates),
    ...coordinates,
    takenAt: new Date(file.lastModified),
    imgSrc: URL.createObjectURL(file),
  };
}

async function saveImage(
  file: File,
  image: Image,
  api: ApiClient
): Promise<void> {
  const imageMetadata: ImageMetadata = {
    latitude: image.latitude,
    longitude: image.longitude,
    takenAt: new Date(file.lastModified),
    name: file.name,
  };

  const presignStuff = await api.presign(imageMetadata);
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

export default ImageUpload;
