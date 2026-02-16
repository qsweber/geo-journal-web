"use client";

import React, { useState, useRef, useCallback } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import bbox from "@turf/bbox";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoicXN3ZWJlciIsImEiOiJjam5nZTZuazgwMTlkM2twYXpjYmpqeTBjIn0.viU-jQrjmOf40aONFwjQdQ";

export default function USMap() {
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [hoveredCountyId, setHoveredCountyId] = useState<string | null>(null);
  const mapRef = useRef<MapRef>(null);

  const handleStateClick = useCallback((e: any) => {
    if (e.features && e.features.length > 0 && mapRef.current) {
      const feature = e.features[0];
      
      // Only zoom to state if we clicked a state feature (not a county)
      if (feature.layer?.id !== "state-fills") return;
      
      // Make sure the feature has geometry
      if (!feature.geometry) return;
      
      try {
        // Calculate the bounding box of the clicked state
        const [minLng, minLat, maxLng, maxLat] = bbox(feature.geometry);
        
        // Fit the map to the state bounds with some padding
        mapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          {
            padding: 40,
            duration: 1000,
          }
        );
      } catch (error) {
        console.error("Error zooming to state:", error);
      }
    }
  }, []);

  const handleCountyClick = useCallback((e: any) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      
      // Only handle county clicks
      if (feature.layer?.id !== "county-fills") return;
      
      console.log("Clicked county:", feature.properties);
      // You can add more functionality here, like showing details or zooming
    }
  }, []);

  return (
    <Map
      ref={mapRef}
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
      interactiveLayerIds={["state-fills", "county-fills"]}
      onMouseMove={(e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          if (feature.layer?.id === "state-fills") {
            setHoveredStateId(feature.properties?.STATE_NAME || null);
            setHoveredCountyId(null);
          } else if (feature.layer?.id === "county-fills") {
            setHoveredCountyId(feature.id?.toString() || null);
            setHoveredStateId(null);
          }
        }
      }}
      onMouseLeave={() => {
        setHoveredStateId(null);
        setHoveredCountyId(null);
      }}
      onClick={(e) => {
        handleStateClick(e);
        handleCountyClick(e);
      }}
      cursor={hoveredStateId || hoveredCountyId ? "pointer" : "grab"}
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

      {/* County boundaries - only visible when zoomed in */}
      <Source
        id="counties"
        type="geojson"
        data="https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json"
      >
        <Layer
          id="county-fills"
          type="fill"
          source="counties"
          minzoom={5}
          paint={{
            "fill-color": "#88B2D9",
            "fill-opacity": [
              "case",
              ["==", ["id"], hoveredCountyId || ""],
              0.2,
              0.05,
            ],
          }}
        />
        <Layer
          id="county-borders"
          type="line"
          source="counties"
          minzoom={5}
          paint={{
            "line-color": "#627BC1",
            "line-width": 1,
            "line-opacity": 0.6,
          }}
        />
      </Source>
    </Map>
  );
}
