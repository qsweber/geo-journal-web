import dynamic from "next/dynamic";

import Layout from "../components/Layout";

const DynamicComponentWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
});

export default () => (
  <Layout>
    <DynamicComponentWithNoSSR stateNames={["Alaska", "Texas"]} />
  </Layout>
);
