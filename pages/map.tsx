import dynamic from "next/dynamic";
import { useState } from "react";

import Layout from "../components/Layout";

const DynamicComponentWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
});

export default () => {
  const [stateName, setStateName] = useState("");
  const [finalStateName, setFinalStateName] = useState("");
  return (
    <Layout>
      <input
        type="text"
        value={stateName}
        onChange={(event) => setStateName(event.target.value)}
      />
      <input
        type="submit"
        value="Submit"
        onClick={async (event) => {
          setFinalStateName(stateName);
          event.preventDefault();
        }}
      />
      <DynamicComponentWithNoSSR
        stateNames={["Alaska", "Texas", finalStateName]}
      />
    </Layout>
  );
};
