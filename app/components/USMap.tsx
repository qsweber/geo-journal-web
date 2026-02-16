"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl/mapbox";
import styled from "@emotion/styled";
import "mapbox-gl/dist/mapbox-gl.css";
import bbox from "@turf/bbox";
import { useMapState } from "./MapStateContext";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoicXN3ZWJlciIsImEiOiJjam5nZTZuazgwMTlkM2twYXpjYmpqeTBjIn0.viU-jQrjmOf40aONFwjQdQ";

const ZoomOutButton = styled.button(() => ({
  position: "absolute",
  top: "20px",
  right: "20px",
  padding: "12px 24px",
  backgroundColor: "#627BC1",
  color: "white",
  border: "none",
  borderRadius: "4px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  zIndex: 10,
  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  "&:hover": {
    backgroundColor: "#526aa3",
  },
}));

const MapContainer = styled.div(() => ({
  position: "relative",
  width: "100%",
  height: "100vh",
}));

export function USMap() {
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [hoveredCountyId, setHoveredCountyId] = useState<string | null>(null);
  const { clickedStates, setClickedStates } = useMapState();
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    // Cleanup function to remove the map when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current._removed = true; // Mark the map as removed to prevent memory leaks
      }
    };
  }, []);

  const handleStateClick = useCallback((e: any) => {
    if (!e.features || e.features.length === 0) return;
    
    const feature = e.features[0];
    if (!feature) return;
    
    // Only handle state clicks (not counties)
    if (feature.layer?.id !== "us-state-fills") return;
    
    const stateName = feature.properties?.STATE_NAME;
    if (stateName) {
      setClickedStates(prev => {
        const newSet = new Set(prev);
        if (newSet.has(stateName)) {
          newSet.delete(stateName);
        } else {
          newSet.add(stateName);
        }
        return newSet;
      });
    }
  }, [setClickedStates]);

  const handleStateDoubleClick = useCallback((e: any) => {
    if (!e.features || e.features.length === 0 || !mapRef.current) return;
    
    const feature = e.features[0];
    if (!feature) return;
    
    // Only zoom to state if we double-clicked a state feature
    if (feature.layer?.id !== "us-state-fills") return;
    
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
  }, []);

  const handleCountyClick = useCallback((e: any) => {
    if (!e.features || e.features.length === 0) return;
    
    const feature = e.features[0];
    if (!feature) return;
    
    // Only handle county clicks
    if (feature.layer?.id !== "us-county-fills") return;
    
    console.log("Clicked county:", feature.properties);
    // You can add more functionality here, like showing details or zooming
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) return;
    
    mapRef.current.flyTo({
      center: [-98.5795, 39.8283],
      zoom: 3.5,
      duration: 1000,
    });
  }, []);

  return (
    <MapContainer>
      <ZoomOutButton onClick={handleZoomOut}>
        Reset View
      </ZoomOutButton>
      <Map
        key="us-map"
        ref={mapRef}
        reuseMaps={false}
        doubleClickZoom={false}
        initialViewState={{
          longitude: -98.5795,
          latitude: 39.8283,
          zoom: 3.5,
        }}
        style={{
          width: "100%",
          height: "100vh",
        }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      interactiveLayerIds={["us-state-fills", "us-county-fills"]}
      onMouseMove={(e) => {
        if (!e.features || e.features.length === 0) return;
        
        const feature = e.features[0];
        if (!feature) return;
        
        if (feature.layer?.id === "us-state-fills") {
          setHoveredStateId(feature.properties?.STATE_NAME ?? null);
          setHoveredCountyId(null);
        } else if (feature.layer?.id === "us-county-fills") {
          setHoveredCountyId(feature.properties?.GEO_ID ?? null);
          setHoveredStateId(null);
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
      onDblClick={handleStateDoubleClick}
      cursor={hoveredStateId || hoveredCountyId ? "pointer" : "grab"}
    >
      <Source
        id="us-states"
        type="geojson"
        data="https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson"
      >
        <Layer
          id="us-state-fills"
          type="fill"
          source="us-states"
          paint={{
            "fill-color": "#627BC1",
            "fill-opacity": [
              "case",
              ["in", ["get", "STATE_NAME"], ["literal", Array.from(clickedStates)]],
              0.3,
              ["==", ["get", "STATE_NAME"], hoveredStateId ?? ""],
              0.3,
              0.0,
            ],
          }}
        />
        <Layer
          id="us-state-borders"
          type="line"
          source="us-states"
          paint={{
            "line-color": "#627BC1",
            "line-width": 2,
          }}
        />
      </Source>

      {/* County boundaries - only visible when zoomed in */}
      <Source
        id="us-counties"
        type="geojson"
        data="https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json"
      >
        <Layer
          id="us-county-fills"
          type="fill"
          source="us-counties"
          minzoom={5}
          paint={{
            "fill-color": "#c288d9",
            "fill-opacity": [
              "case",
              ["==", ["get", "GEO_ID"], hoveredCountyId ?? ""],
              0.2,
              0.0,
            ],
          }}
        />
        <Layer
          id="us-county-borders"
          type="line"
          source="us-counties"
          minzoom={5}
          paint={{
            "line-color": "#627BC1",
            "line-width": 1,
            "line-opacity": 0.6,
          }}
        />
      </Source>
    </Map>
    </MapContainer>
  );
}
