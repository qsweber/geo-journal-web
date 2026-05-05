"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Map, { Source, Layer, MapRef, Marker } from "react-map-gl/mapbox";
import styled from "@emotion/styled";
import "mapbox-gl/dist/mapbox-gl.css";
import bbox from "@turf/bbox";
import { useMapState } from "./MapStateContext";
import { useAuth } from "../../lib/auth/useAuth";
import { useApiClient } from "../../lib/api/useApiClient";

interface ImageLocation {
  lat: number;
  lng: number;
  filename: string;
  dataUrl?: string;
}

function toApiImageLocation(img: {
  latitude: string;
  longitude: string;
  name: string;
  presigned_url: string;
}): ImageLocation | null {
  const lat = Number.parseFloat(img.latitude);
  const lng = Number.parseFloat(img.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return {
    lat,
    lng,
    filename: img.name,
    dataUrl: img.presigned_url,
  };
}

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

const AddImagesButton = styled.button(() => ({
  position: "absolute",
  top: "70px",
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

const HiddenFileInput = styled.input(() => ({
  display: "none",
}));

const ModalOverlay = styled.div(() => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
}));

const ModalContent = styled.div(() => ({
  position: "relative",
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "20px",
  maxWidth: "90%",
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
}));

const ModalImage = styled.img(() => ({
  maxWidth: "100%",
  maxHeight: "80vh",
  display: "block",
}));

const CloseButton = styled.button(() => ({
  position: "absolute",
  top: "10px",
  right: "10px",
  backgroundColor: "#627BC1",
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "8px 12px",
  fontSize: "16px",
  cursor: "pointer",
  zIndex: 1001,
  "&:hover": {
    backgroundColor: "#526aa3",
  },
}));

const ImageFilename = styled.p(() => ({
  marginTop: "16px",
  marginBottom: 0,
  color: "#333",
  fontSize: "14px",
  fontWeight: "600",
}));

export function USMap() {
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [hoveredCountyId, setHoveredCountyId] = useState<string | null>(null);
  const [imageLocations, setImageLocations] = useState<ImageLocation[]>([]);
  const [apiImageLocations, setApiImageLocations] = useState<ImageLocation[]>(
    [],
  );
  const [selectedImage, setSelectedImage] = useState<ImageLocation | null>(
    null,
  );
  const { clickedStates, setClickedStates } = useMapState();
  const { isAuthenticated } = useAuth();
  const apiClient = useApiClient();
  const mapRef = useRef<MapRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup function to remove the map when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current._removed = true; // Mark the map as removed to prevent memory leaks
      }
    };
  }, []);

  // Fetch the user's images from the API whenever they become authenticated
  useEffect(() => {
    if (!isAuthenticated || !apiClient) {
      setApiImageLocations([]);
      return;
    }

    apiClient
      .getImages()
      .then(({ images }) => {
        const locations = images
          .map(toApiImageLocation)
          .filter((location): location is ImageLocation => location !== null);
        setApiImageLocations(locations);
      })
      .catch((err) => {
        console.error("Failed to load images from API:", err);
      });
  }, [isAuthenticated, apiClient]);

  const getStateFromCoordinates = useCallback(
    async (lat: number, lng: number): Promise<string | null> => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`,
        );
        const data = await response.json();

        if (!data.features || data.features.length === 0) {
          console.warn("No results from geocoding API");
          return null;
        }

        // Find the region feature (state)
        for (const feature of data.features) {
          if (feature.id?.startsWith("region.")) {
            const stateName = feature.text;
            console.log(`Found state from geocoding API: ${stateName}`);
            return stateName;
          }
        }

        console.warn("No region found in geocoding results");
        return null;
      } catch (error) {
        console.error("Error calling Mapbox Geocoding API:", error);
        return null;
      }
    },
    [],
  );

  const handleStateClick = useCallback(
    (e: any) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];
      if (!feature) return;

      // Only handle state clicks (not counties)
      if (feature.layer?.id !== "us-state-fills") return;

      const stateName = feature.properties?.STATE_NAME;
      if (stateName) {
        setClickedStates((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(stateName)) {
            newSet.delete(stateName);
          } else {
            newSet.add(stateName);
          }
          return newSet;
        });
      }
    },
    [setClickedStates],
  );

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
        },
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

  const extractGPSFromExif = (
    exifData: any,
  ): { lat: number; lng: number } | null => {
    try {
      console.log("EXIF Data:", exifData);

      if (!exifData) {
        console.warn("No EXIF data provided");
        return null;
      }

      const gpsLat = exifData.GPSLatitude;
      const gpsLng = exifData.GPSLongitude;
      const gpsLatRef = exifData.GPSLatitudeRef;
      const gpsLngRef = exifData.GPSLongitudeRef;

      console.log("GPS Lat:", gpsLat, "Ref:", gpsLatRef);
      console.log("GPS Lng:", gpsLng, "Ref:", gpsLngRef);

      if (!gpsLat || !gpsLng) {
        console.warn("Missing GPS coordinates");
        return null;
      }

      const toDecimal = (gpsCoord: any, gpsRef: string): number => {
        // Handle both array format and tuple format from piexif
        let d, m, s;

        if (Array.isArray(gpsCoord)) {
          // Could be [degrees, minutes, seconds] or [[num, denom], [num, denom], [num, denom]]
          d =
            typeof gpsCoord[0] === "object"
              ? gpsCoord[0][0] / gpsCoord[0][1]
              : gpsCoord[0];
          m =
            typeof gpsCoord[1] === "object"
              ? gpsCoord[1][0] / gpsCoord[1][1]
              : gpsCoord[1];
          s =
            typeof gpsCoord[2] === "object"
              ? gpsCoord[2][0] / gpsCoord[2][1]
              : gpsCoord[2];
        } else {
          console.warn("Unexpected GPS coordinate format:", gpsCoord);
          return NaN;
        }

        let decimal = d + m / 60 + s / 3600;
        if (gpsRef === "S" || gpsRef === "W") {
          decimal = decimal * -1;
        }

        console.log(
          `Converted ${gpsRef}: ${d} + ${m}/60 + ${s}/3600 = ${decimal}`,
        );
        return decimal;
      };

      const lat = toDecimal(gpsLat, gpsLatRef ?? "N");
      const lng = toDecimal(gpsLng, gpsLngRef ?? "E");

      if (isNaN(lat) || isNaN(lng)) {
        console.warn("Invalid GPS coordinates:", { lat, lng });
        return null;
      }

      return { lat, lng };
    } catch (error) {
      console.error("Error extracting GPS from EXIF:", error);
      return null;
    }
  };

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (!files) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          const reader = new FileReader();

          reader.onload = async (event) => {
            try {
              const data = event.target?.result;
              if (!(data instanceof ArrayBuffer)) return;

              const piexif = await import("piexifjs");

              // Convert ArrayBuffer to binary string safely (avoid stack overflow)
              const bytes = new Uint8Array(data);
              let binary = "";
              for (let j = 0; j < bytes.length; j++) {
                binary += String.fromCharCode(bytes[j]);
              }

              let exifDict: Record<string, any>;
              try {
                exifDict = piexif.load(binary);
              } catch (e) {
                console.warn(`${file.name} has no EXIF data or corrupted EXIF`);
                return;
              }

              const gpsData = exifDict.GPS;
              if (!gpsData || !piexif.TAGS?.GPS) {
                console.warn(`${file.name} has no GPS data`);
                return;
              }

              const gpsInfo: Record<string, any> = {};
              for (const tag in gpsData) {
                const tagNum = parseInt(tag);
                if (piexif.TAGS.GPS[tagNum]) {
                  const tagName = piexif.TAGS.GPS[tagNum]["name"];
                  gpsInfo[tagName] = gpsData[tag];
                }
              }

              const coords = extractGPSFromExif(gpsInfo);
              if (coords) {
                console.log(`Extracted GPS for ${file.name}:`, coords);

                // Upload to S3 via API presign flow when authenticated.
                if (isAuthenticated && apiClient) {
                  try {
                    const takenAt = Math.floor(
                      (file.lastModified || Date.now()) / 1000,
                    ).toString();

                    await apiClient.uploadImage(
                      {
                        name: file.name,
                        latitude: coords.lat.toString(),
                        longitude: coords.lng.toString(),
                        taken_at: takenAt,
                      },
                      file,
                    );

                    const { images } = await apiClient.getImages();
                    setApiImageLocations(
                      images
                        .map(toApiImageLocation)
                        .filter(
                          (location): location is ImageLocation =>
                            location !== null,
                        ),
                    );
                  } catch (uploadError) {
                    console.error(
                      `Failed to upload ${file.name}:`,
                      uploadError,
                    );
                  }
                }

                // Extract the state from the coordinates using Mapbox Geocoding API
                getStateFromCoordinates(coords.lat, coords.lng).then(
                  (stateName) => {
                    if (stateName) {
                      console.log(`Image from state: ${stateName}`);
                      // Add the state to clicked states
                      setClickedStates((prev) => {
                        const newSet = new Set(prev);
                        newSet.add(stateName);
                        return newSet;
                      });
                    } else {
                      console.warn(
                        `Could not determine state for coordinates: ${coords.lat}, ${coords.lng}`,
                      );
                    }
                  },
                );

                // Create a data URL from the image file for display in modal
                const imageReader = new FileReader();
                imageReader.onload = (imageEvent) => {
                  const location: ImageLocation = {
                    lat: coords.lat,
                    lng: coords.lng,
                    filename: file.name,
                    dataUrl: (imageEvent.target?.result as string) ?? undefined,
                  };

                  setImageLocations((prev) => [...prev, location]);
                };
                imageReader.readAsDataURL(file);
              } else {
                console.warn(`${file.name} has no valid GPS data`);
              }
            } catch (error) {
              console.error(`Error processing ${file.name}:`, error);
            }
          };

          reader.readAsArrayBuffer(file);
        } catch (error) {
          console.error(`Error reading ${file.name}:`, error);
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [
      apiClient,
      getStateFromCoordinates,
      isAuthenticated,
      setClickedStates,
      setApiImageLocations,
    ],
  );

  const handleAddImages = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <MapContainer>
      <Map
        ref={mapRef}
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
                [
                  "in",
                  ["get", "STATE_NAME"],
                  ["literal", Array.from(clickedStates)],
                ],
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

        {/* Image location markers (local uploads + API images) */}
        {[...apiImageLocations, ...imageLocations].map((location, index) => (
          <Marker
            key={`image-marker-${index}`}
            longitude={location.lng}
            latitude={location.lat}
            anchor="bottom"
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: "#FF6B6B",
                borderRadius: "50%",
                border: "3px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "16px",
              }}
              title={location.filename}
              onClick={() => setSelectedImage(location)}
            >
              📸
            </div>
          </Marker>
        ))}
      </Map>

      <ZoomOutButton onClick={handleZoomOut}>Reset View</ZoomOutButton>
      <AddImagesButton onClick={handleAddImages}>Add Images</AddImagesButton>
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* Image modal */}
      {selectedImage && selectedImage.dataUrl && (
        <ModalOverlay onClick={() => setSelectedImage(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedImage(null)}>✕</CloseButton>
            <ModalImage
              src={selectedImage.dataUrl}
              alt={selectedImage.filename}
            />
            <ImageFilename>{selectedImage.filename}</ImageFilename>
          </ModalContent>
        </ModalOverlay>
      )}
    </MapContainer>
  );
}
