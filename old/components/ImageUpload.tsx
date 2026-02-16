import React from "react";

import { Image } from "../interfaces";
import { ApiClient } from "../clients/api";
import { getLatLong } from "../lib/exif";

interface Props {
  api: ApiClient | undefined;
  callback: (newImages: Image[]) => Promise<void>;
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
          if (!file) {
            continue;
          }

          const coordinates = await getLatLong(file);
          const image: Image = {
            name: file.name,
            coordinates,
            takenAt: new Date(file.lastModified),
            imgSrc: URL.createObjectURL(file),
          };
          newImages.push(image);
          if (props.api) {
            await props.api.saveImage(file, {
              latitude: image.coordinates.latitude,
              longitude: image.coordinates.longitude,
              takenAt: new Date(file.lastModified),
              name: file.name,
            });
          }
        }
        props.callback(newImages);
      }}
    />
  );
};

export default ImageUpload;
