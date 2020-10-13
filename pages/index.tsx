import dynamic from "next/dynamic";
import React, { useState } from "react";
import useSWR from "swr";

import Layout from "../components/Layout";

import { Image, ImageAndLocations } from "../interfaces";
import ImageUpload from "../components/ImageUpload";
import Counter from "../components/Counter";
import { convertImageToImageWithLevels, getInitialData } from "../lib/loader";

const DynamicComponentWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
});

const IndexPage = () => {
  const [uploadedImages, setUploadedImages] = useState<ImageAndLocations[]>([]);
  const result = useSWR("user", getInitialData);

  const allImages = [
    ...uploadedImages,
    ...(result.data ? result.data.savedImages : []),
  ];
  console.log("IndexPage");
  return (
    <Layout loggedInUser={result.data?.user}>
      <DynamicComponentWithNoSSR images={allImages}>
        <div style={{ paddingBottom: 8 }}>
          <ImageUpload
            api={result.data?.api}
            callback={async (newImages: Image[]) => {
              setUploadedImages([
                ...uploadedImages,
                ...(await convertImageToImageWithLevels(newImages)),
              ]);
            }}
          />
        </div>
        <Counter images={allImages} />
      </DynamicComponentWithNoSSR>
    </Layout>
  );
};

export default IndexPage;
