import dynamic from "next/dynamic";
import { useState } from "react";

import Layout from "../components/Layout";
import { Image } from "../components/Map";
import { getLatLong } from "../components/lib/exif";
import MapboxClient from "../clients/mapbox";

const DynamicComponentWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
});

const mapbox = new MapboxClient();

export default () => {
  const initialState: Image = {
    stateName: "fake",
    latitude: 0,
    longitude: 0,
    file: undefined as any,
  };
  const [images, setImages] = useState([initialState]);
  return (
    <Layout>
      <input
        type="file"
        multiple
        onChange={async (event) => {
          if (event.target.files) {
            const fileList = event.target.files;
            const newImages: Image[] = [];
            for (let i = 0; i < fileList.length; i++) {
              const file = fileList.item(i);
              if (file) {
                const coordinates = await getLatLong(file);
                newImages.push({
                  stateName: await mapbox.getStateFromCoordinates(coordinates),
                  ...coordinates,
                  file,
                });
              }
            }
            setImages([...images, ...newImages]);
          }
        }}
      />
      <br />
      <span>{`${new Set(images).size - 1} / 50`}</span>
      <DynamicComponentWithNoSSR images={images.slice(1)} />
    </Layout>
  );
};
