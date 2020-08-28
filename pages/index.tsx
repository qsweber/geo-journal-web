import dynamic from "next/dynamic";
import { useState } from "react";
import useSWR from "swr";

import Layout from "../components/Layout";
import { Image } from "../components/Map";
import { getLatLong } from "../lib/exif";
import MapboxClient from "../clients/mapbox";
import { CognitoClient } from "../clients/cognito";
import { ApiClient, Image as ApiImage, ImageMetadata } from "../clients/api";
import { User } from "../interfaces";

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
  const images = await Promise.all(imageMetadata.map(getImageFromApiImage))
  return { api, user, savedImages: images };
}

async function getImageFromApiImage(apiImage: ApiImage): Promise<Image> {
  const imgBlob = await (await fetch(apiImage.presignedUrl, { method: 'GET'})).blob();
  console.log('hi', imgBlob);
  const imgSrc = URL.createObjectURL(imgBlob);
  console.log('hi2');
  return {
    stateName: await mapbox.getStateFromCoordinates(
      { latitude: apiImage.metadata.latitude, longitude: apiImage.metadata.longitude}
    ),
    latitude: apiImage.metadata.latitude,
    longitude: apiImage.metadata.longitude,
    takenAt: apiImage.metadata.takenAt,
    imgSrc,
  }
}

async function getImageFromUploadedFile(file: File): Promise<Image> {
  const coordinates = await getLatLong(file);
  return {
    stateName: await mapbox.getStateFromCoordinates(
      coordinates
    ),
    ...coordinates,
    takenAt: new Date(file.lastModified),
    imgSrc: URL.createObjectURL(file),
  }
}

async function saveImage(file: File, image: Image, api: ApiClient): Promise<void> {
  const imageMetadata: ImageMetadata = {
    latitude: image.latitude,
    longitude: image.longitude,
    takenAt: new Date(file.lastModified),
    name: file.name,
  }

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

const IndexPage = () => {
  const [images, setImages] = useState<Image[]>([]);
  const result = useSWR("user", getInitialData);

  return (
    <Layout loggedInUser={result.data?.user}>
      <div style={{ paddingBottom: 8 }}>
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
                  const image = await getImageFromUploadedFile(file);
                  newImages.push(image);
                  if (result.data) {
                    await saveImage(file, image, result.data.api);
                  }
                }
              }
              setImages([...images, ...newImages]);
            }
          }}
        />
        <span>{`States you've been to: ${new Set(images.concat(result.data ? result.data.savedImages : [])).size} / 50`}</span>
      </div>
      <DynamicComponentWithNoSSR images={images.concat(result.data ? result.data.savedImages : [])} />
    </Layout>
  );
};

export default IndexPage;
