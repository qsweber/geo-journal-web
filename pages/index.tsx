import dynamic from "next/dynamic";
import { useState } from "react";
import useSWR from "swr";

import Layout from "../components/Layout";
import { Image } from "../components/Map";
import { getLatLong } from "../lib/exif";
import MapboxClient from "../clients/mapbox";
import { CognitoClient } from "../clients/cognito";
import { User } from "../interfaces";

const DynamicComponentWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
});

const mapbox = new MapboxClient();
const cognitoClient = new CognitoClient();

async function getUser(): Promise<User | "not logged in"> {
  const result = await cognitoClient.checkForLoggedInUser();
  console.log(JSON.stringify(result));
  return result || "not logged in";
}

function isUser(foo: User | "not logged in"): foo is User {
  return (foo as User).jwtToken !== undefined;
}

const IndexPage = () => {
  const [images, setImages] = useState<Image[]>([]);
  const result = useSWR("user", getUser);

  if (!result.data) {
    return <p>Loading...</p>;
  }

  if (!isUser(result.data)) {
    return (
      <Layout loggedInUser={undefined}>
        <div />
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
      <span>{`States you've been to: ${new Set(images).size} / 50`}</span>
    </div>
    <DynamicComponentWithNoSSR images={images} />
  </div>
);

export default IndexPage;
