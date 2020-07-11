import dynamic from "next/dynamic";
import { useState } from "react";
import fetch from "isomorphic-unfetch";

import Layout from "../components/Layout";
import { getLatLong } from "../components/lib/exif";

const DynamicComponentWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
});

export default () => {
  const initialState = {
    stateName: "Washington",
    latitude: 47,
    longitude: -122,
  };
  const [typedStateName, setTypedStateName] = useState("");
  const [finalStateNames, setFinalStateNames] = useState([initialState]);
  return (
    <Layout>
      <input
        type="text"
        value={typedStateName}
        onChange={(event) => setTypedStateName(event.target.value)}
      />
      <br />
      <input
        type="submit"
        value="Submit"
        onClick={async (event) => {
          setFinalStateNames([
            ...finalStateNames,
            { stateName: typedStateName, latitude: 40, longitude: -117 },
          ]);
          event.preventDefault();
        }}
      />
      <input
        type="file"
        onChange={async (event) => {
          if (event.target.files) {
            const coordinates = await getLatLong(event.target.files?.[0]);
            const result = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json?access_token=pk.eyJ1IjoicXN3ZWJlciIsImEiOiJjam5nZTZuazgwMTlkM2twYXpjYmpqeTBjIn0.viU-jQrjmOf40aONFwjQdQ`
            );
            const data = await result.json();
            for (let feature of data.features) {
              if (feature.context) {
                for (let context of feature.context) {
                  if ((context.id as string).startsWith("region")) {
                    const uploadedState = context.text as string;
                    setFinalStateNames([
                      ...finalStateNames,
                      { stateName: uploadedState, ...coordinates },
                    ]);
                    break;
                  }
                }
              }
            }
          }
        }}
      />
      <br />
      <span>{`${finalStateNames.length - 1} / 50`}</span>
      <DynamicComponentWithNoSSR states={finalStateNames.slice(1)} />
    </Layout>
  );
};
