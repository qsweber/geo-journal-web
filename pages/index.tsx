import dynamic from "next/dynamic";
import React, { useState } from "react";
import useSWR from "swr";

import Layout from "../components/Layout";
import { Image } from "../components/Map";
import MapboxClient from "../clients/mapbox";
import { CognitoClient } from "../clients/cognito";
import { ApiClient, Image as ApiImage } from "../clients/api";
import { User } from "../interfaces";
import ImageUpload from "../components/ImageUpload";

const DynamicComponentWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
});

const mapbox = new MapboxClient();
const cognitoClient = new CognitoClient();

async function getInitialData(): Promise<{
  api: ApiClient;
  user: User;
  savedImages: Image[];
}> {
  const user = await cognitoClient.checkForLoggedInUser();
  if (!user) {
    throw new Error("not logged in");
  }
  const api = new ApiClient(user);
  const imageMetadata = await api.getImages();
  const images = await Promise.all(imageMetadata.map(getImageFromApiImage));
  return { api, user, savedImages: images };
}

async function getImageFromApiImage(apiImage: ApiImage): Promise<Image> {
  const imgBlob = await (
    await fetch(apiImage.presignedUrl, { method: "GET" })
  ).blob();
  console.log("hi", imgBlob);
  const imgSrc = URL.createObjectURL(imgBlob);
  console.log("hi2");
  return {
    stateName: await mapbox.getStateFromCoordinates({
      latitude: apiImage.metadata.latitude,
      longitude: apiImage.metadata.longitude,
    }),
    latitude: apiImage.metadata.latitude,
    longitude: apiImage.metadata.longitude,
    takenAt: apiImage.metadata.takenAt,
    imgSrc,
  };
}

const IndexPage = () => {
  const [images, setImages] = useState<Image[]>([]);
  const result = useSWR("user", getInitialData);

  const states = images
    .map((i) => i.stateName)
    .concat(result.data ? result.data.savedImages.map((i) => i.stateName) : []);
  console.log(states);

  return (
    <Layout loggedInUser={result.data?.user}>
      <div style={{ paddingBottom: 8 }}>
        <ImageUpload
          loggedInUser={result.data?.user}
          api={result.data?.api}
          mapbox={mapbox}
          callback={(newImages: Image[]) => {
            setImages([...images, ...newImages]);
          }}
        />
        <span>{`States you've been to: ${
          new Set(states.filter((s) => !!s)).size
        } / 50`}</span>
      </div>
      <DynamicComponentWithNoSSR
        images={images.concat(result.data ? result.data.savedImages : [])}
      />
    </Layout>
  );
};

export default IndexPage;
