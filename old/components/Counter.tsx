import React from "react";
import { ImageAndLocations } from "../interfaces";

interface Props {
  images: ImageAndLocations[];
}

const Counter = (props: Props) => {
  return (
    <div>
      <span>{`US States you've been to: ${
        new Set(
          props.images
            .filter((s) => s.country === "United States" && !!s.region)
            .map((i) => i.region)
        ).size
      } / 50`}</span>
      <br />
      <span>{`Canadian Provinces you've been to: ${
        new Set(
          props.images
            .filter((s) => s.country === "Canada" && !!s.region)
            .map((i) => i.region)
        ).size
      } / 7`}</span>
      <br />
      <span>{`Countries you've been to: ${
        new Set(props.images.map((i) => i.country)).size
      } / 7`}</span>
    </div>
  );
};

export default Counter;
