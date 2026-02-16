"use client";

import React, { useState } from "react";
import Map, { Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoicXN3ZWJlciIsImEiOiJjam5nZTZuazgwMTlkM2twYXpjYmpqeTBjIn0.viU-jQrjmOf40aONFwjQdQ";

export default function USMap() {
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  return (
    <Map
      initialViewState={{
        longitude: -98.5795,
        latitude: 39.8283,
        zoom: 3.5,
      }}
      style={{
        width: "100%",
        height: "calc(100vh - 64px)",
      }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      interactiveLayerIds={["state-fills"]}
      onMouseMove={(e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          setHoveredStateId(feature.properties?.STATE_NAME || null);
        }
      }}
      onMouseLeave={() => {
        setHoveredStateId(null);
      }}
    >
      <Source
        id="states"
        type="geojson"
        data="https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson"
      >
        <Layer
          id="state-fills"
          type="fill"
          source="states"
          paint={{
            "fill-color": "#627BC1",
            "fill-opacity": [
              "case",
              ["==", ["get", "STATE_NAME"], hoveredStateId || ""],
              0.3,
              0.1,
            ],
          }}
        />
        <Layer
          id="state-borders"
          type="line"
          source="states"
          paint={{
            "line-color": "#627BC1",
            "line-width": 2,
          }}
        />
      </Source>
    </Map>
  );
}
