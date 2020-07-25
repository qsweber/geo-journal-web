import dynamic from "next/dynamic";
import { useState } from "react";
import useSWR from "swr";

import Layout from "../components/Layout";
import { Image } from "../components/Map";
import { getLatLong } from "../lib/exif";
import MapboxClient from "../clients/mapbox";
import { CognitoClient } from "../clients/cognito";
import { ApiClient } from "../clients/api";
import { User } from "../interfaces";

const DynamicComponentWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
});

const mapbox = new MapboxClient();
const cognitoClient = new CognitoClient();

async function getInitialData(): Promise<{ user: User; images: Image[] }> {
  const user = await cognitoClient.checkForLoggedInUser();
  if (!user) {
    throw new Error("not logged in");
  }
  const api = new ApiClient(user);
  const images = await api.getImages();
  return { user, images };
}

const IndexPage = () => {
  const [images, setImages] = useState<Image[]>([]);
  const result = useSWR("user", getInitialData);

  if (!result.data && !result.error) {
    return <p>Loading...</p>;
  }

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
                  const coordinates = await getLatLong(file);
                  newImages.push({
                    stateName: await mapbox.getStateFromCoordinates(
                      coordinates
                    ),
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
    </Layout>
  );
};

export default IndexPage;
