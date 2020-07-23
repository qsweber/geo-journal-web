import dynamic from "next/dynamic";
import { useState } from "react";
import useSWR from "swr";

import Layout from "../components/Layout";
import { Image } from "../components/Map";
import { getLatLong } from "../lib/exif";
import MapboxClient from "../clients/mapbox";
import { User, CognitoClient } from "../clients/cognito";

const DynamicComponentWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
});

const mapbox = new MapboxClient();
const cognitoClient = new CognitoClient();

async function getUser(): Promise<User | "not logged in"> {
  const result = await cognitoClient.checkForLoggedInUser();
  return result || "not logged in";
}

function isUser(foo: User | "not logged in"): foo is User {
  return (foo as User).jwtToken !== undefined;
}

const MapPage = () => {
  const [images, setImages] = useState<Image[]>([]);
  const result = useSWR("user", getUser);

  if (!result.data) {
    return <p>Loading...</p>;
  }

  if (!isUser(result.data)) {
    return (
      <Layout loggedInUser={undefined}>
        <p>Please log in</p>
      </Layout>
    );
  }

  return (
    <Layout loggedInUser={result.data}>
      {getMapSection(images, setImages)}
    </Layout>
  );
};

const getMapSection = (
  images: Image[],
  setImages: (images: Image[]) => void
) => (
  <div>
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
    <span>{`${new Set(images).size} / 50`}</span>
    <DynamicComponentWithNoSSR images={images} />
  </div>
);

export default MapPage;
