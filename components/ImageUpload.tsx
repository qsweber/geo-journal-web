import React from "react";

import { User } from "../interfaces";
import { Image } from "./Map";
import { ApiClient } from "../clients/api";
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
            const coordinates = await getLatLong(file);
            const image = {
              stateName: await props.mapbox.getStateFromCoordinates(
                coordinates
              ),
              ...coordinates,
              takenAt: new Date(file.lastModified),
              imgSrc: URL.createObjectURL(file),
            };
            newImages.push(image);
            if (props.api) {
              await props.api.saveImage(file, {
                latitude: image.latitude,
                longitude: image.longitude,
                takenAt: new Date(file.lastModified),
                name: file.name,
              });
            }
          }
        }
        props.callback(newImages);
      }}
    />
  );
};

export default ImageUpload;
