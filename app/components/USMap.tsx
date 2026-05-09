"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Map, { Source, Layer, MapRef, Marker } from "react-map-gl/mapbox";
import styled from "@emotion/styled";
import "mapbox-gl/dist/mapbox-gl.css";
import bbox from "@turf/bbox";
import { useMapState, type VisitedLocation } from "./MapStateContext";
import { useAuth } from "../../lib/auth/useAuth";
import { useApiClient } from "../../lib/api/useApiClient";

function toApiImageLocation(img: {
  latitude: string;
  longitude: string;
  name: string;
  presigned_url: string;
}): VisitedLocation | null {
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
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.6,
  },
}));

const ControlsDock = styled.div(() => ({
  position: "fixed",
  left: "50%",
  transform: "translateX(-50%)",
  bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
  display: "flex",
  flexDirection: "row",
  gap: "10px",
  zIndex: 10,
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

const ManualAssignPanel = styled.div(() => ({
  position: "fixed",
  top: "114px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: "8px",
  padding: "16px 18px",
  zIndex: 102,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  border: "1px solid #d8e0f5",
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  maxWidth: "min(520px, calc(100% - 24px))",
}));

const ManualAssignText = styled.p(() => ({
  margin: 0,
  color: "#233059",
  fontSize: "14px",
  lineHeight: 1.4,
  fontWeight: 600,
}));

const SkipButton = styled.button(() => ({
  padding: "8px 12px",
  borderRadius: "4px",
  border: "1px solid #627BC1",
  backgroundColor: "white",
  color: "#627BC1",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  "&:hover": {
    backgroundColor: "#f3f6ff",
  },
}));

const DisabledZoomOutButton = styled(ZoomOutButton)(() => ({
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.6,
  },
}));

type PendingManualAssignment = {
  file: File;
  takenAt: string;
  dataUrl?: string;
  filename: string;
};

export function USMap() {
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [hoveredCountyId, setHoveredCountyId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<VisitedLocation | null>(
    null,
  );
  const [activeManualAssignment, setActiveManualAssignment] =
    useState<PendingManualAssignment | null>(null);
  const {
    visitedStates,
    setVisitedStates,
    visitedLocations,
    setVisitedLocations,
  } = useMapState();
  const { isAuthenticated } = useAuth();
  const apiClient = useApiClient();
  const mapRef = useRef<MapRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = useCallback(
    async (file: File): Promise<string | undefined> =>
      new Promise((resolve) => {
        const imageReader = new FileReader();
        imageReader.onload = (event) => {
          resolve((event.target?.result as string) ?? undefined);
        };
        imageReader.onerror = () => resolve(undefined);
        imageReader.readAsDataURL(file);
      }),
    [],
  );

  const currentManualAssignment = activeManualAssignment;

  useEffect(() => {
    const map = mapRef.current;

    // Cleanup function to remove the map when component unmounts
    return () => {
      if (map) {
        map._removed = true; // Mark the map as removed to prevent memory leaks
      }
    };
  }, []);

  // Fetch the user's images from the API whenever they become authenticated
  useEffect(() => {
    if (!isAuthenticated || !apiClient) {
      setVisitedLocations([]);
      return;
    }

    apiClient
      .getImages()
      .then(({ images }) => {
        const locations = images
          .map(toApiImageLocation)
          .filter((location): location is VisitedLocation => location !== null);
        setVisitedLocations(locations);
      })
      .catch((err) => {
        console.error("Failed to load images from API:", err);
      });
  }, [isAuthenticated, apiClient, setVisitedLocations]);

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

  useEffect(() => {
    let isCancelled = false;

    if (visitedLocations.length === 0) {
      setVisitedStates(new Set());
      return;
    }

    Promise.all(
      visitedLocations.map(async (location) =>
        getStateFromCoordinates(location.lat, location.lng),
      ),
    )
      .then((stateNames) => {
        if (isCancelled) return;

        const nextVisitedStates = new Set<string>();
        stateNames.forEach((stateName) => {
          if (stateName) {
            nextVisitedStates.add(stateName);
          }
        });
        setVisitedStates(nextVisitedStates);
      })
      .catch((error) => {
        console.error("Failed to derive visited states from locations:", error);
      });

    return () => {
      isCancelled = true;
    };
  }, [getStateFromCoordinates, setVisitedStates, visitedLocations]);

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

  const handleManualStateSelection = useCallback(
    (e: any) => {
      if (!currentManualAssignment) return;
      if (!e.features || e.features.length === 0) return;

      const selectedStateFeature = e.features.find(
        (feature: any) => feature.layer?.id === "us-state-fills",
      );
      if (!selectedStateFeature) return;

      const stateName = selectedStateFeature.properties?.STATE_NAME;
      if (!stateName) return;

      const clickLat = e.lngLat?.lat;
      const clickLng = e.lngLat?.lng;
      if (!Number.isFinite(clickLat) || !Number.isFinite(clickLng)) return;

      const assignedLocation: VisitedLocation = {
        lat: clickLat,
        lng: clickLng,
        filename: currentManualAssignment.filename,
        dataUrl: currentManualAssignment.dataUrl,
      };

      if (isAuthenticated && apiClient) {
        apiClient
          .uploadImage(
            {
              name: currentManualAssignment.filename,
              latitude: clickLat.toString(),
              longitude: clickLng.toString(),
              taken_at: currentManualAssignment.takenAt,
            },
            currentManualAssignment.file,
          )
          .catch((uploadError) => {
            console.error(
              `Failed to upload ${currentManualAssignment.filename}:`,
              uploadError,
            );
          });
      }

      setVisitedLocations((prev) => [...prev, assignedLocation]);
      setActiveManualAssignment(null);
      setVisitedStates((prev) => {
        const nextVisitedStates = new Set(prev);
        nextVisitedStates.add(stateName);
        return nextVisitedStates;
      });
    },
    [
      apiClient,
      currentManualAssignment,
      isAuthenticated,
      setVisitedLocations,
      setVisitedStates,
    ],
  );

  const handleMapClick = useCallback(
    (e: any) => {
      if (currentManualAssignment) {
        handleManualStateSelection(e);
        return;
      }

      handleCountyClick(e);
    },
    [currentManualAssignment, handleCountyClick, handleManualStateSelection],
  );

  const handleSkipManualAssignment = useCallback(() => {
    setActiveManualAssignment(null);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (currentManualAssignment) return;
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: [-98.5795, 39.8283],
      zoom: 3.5,
      duration: 1000,
    });
  }, [currentManualAssignment]);

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
              } catch {
                console.warn(`${file.name} has no EXIF data or corrupted EXIF`);
                const dataUrl = await readFileAsDataUrl(file);
                setActiveManualAssignment({
                  file,
                  takenAt: Math.floor(
                    (file.lastModified || Date.now()) / 1000,
                  ).toString(),
                  dataUrl,
                  filename: file.name,
                });
                return;
              }

              const gpsData = exifDict.GPS;
              if (!gpsData || !piexif.TAGS?.GPS) {
                console.warn(`${file.name} has no GPS data`);
                const dataUrl = await readFileAsDataUrl(file);
                setActiveManualAssignment({
                  file,
                  takenAt: Math.floor(
                    (file.lastModified || Date.now()) / 1000,
                  ).toString(),
                  dataUrl,
                  filename: file.name,
                });
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

                const takenAt = Math.floor(
                  (file.lastModified || Date.now()) / 1000,
                ).toString();

                const location: VisitedLocation = {
                  lat: coords.lat,
                  lng: coords.lng,
                  filename: file.name,
                };

                const geocodedState = await getStateFromCoordinates(
                  coords.lat,
                  coords.lng,
                );
                if (!geocodedState) {
                  const dataUrl = await readFileAsDataUrl(file);
                  setActiveManualAssignment({
                    file,
                    takenAt,
                    dataUrl,
                    filename: file.name,
                  });
                  return;
                }

                // Upload to S3 via API presign flow when authenticated.
                if (isAuthenticated && apiClient) {
                  try {
                    await apiClient.uploadImage(
                      {
                        name: file.name,
                        latitude: coords.lat.toString(),
                        longitude: coords.lng.toString(),
                        taken_at: takenAt,
                      },
                      file,
                    );
                  } catch (uploadError) {
                    console.error(
                      `Failed to upload ${file.name}:`,
                      uploadError,
                    );
                  }
                }

                const dataUrl = await readFileAsDataUrl(file);
                setVisitedLocations((prev) => [
                  ...prev,
                  {
                    ...location,
                    dataUrl,
                  },
                ]);
              } else {
                console.warn(`${file.name} has no valid GPS data`);
                const dataUrl = await readFileAsDataUrl(file);
                setActiveManualAssignment({
                  file,
                  takenAt: Math.floor(
                    (file.lastModified || Date.now()) / 1000,
                  ).toString(),
                  dataUrl,
                  filename: file.name,
                });
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
      readFileAsDataUrl,
      setVisitedLocations,
    ],
  );

  const handleAddImages = useCallback(() => {
    if (currentManualAssignment) return;
    fileInputRef.current?.click();
  }, [currentManualAssignment]);

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
        interactiveLayerIds={
          currentManualAssignment
            ? ["us-state-fills"]
            : ["us-state-fills", "us-county-fills"]
        }
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
        onClick={handleMapClick}
        onDblClick={
          currentManualAssignment ? undefined : handleStateDoubleClick
        }
        cursor={
          currentManualAssignment || hoveredStateId || hoveredCountyId
            ? "pointer"
            : "grab"
        }
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
              "fill-color": [
                "case",
                ["==", ["get", "STATE_NAME"], hoveredStateId ?? ""],
                "#AFC0EA",
                [
                  "in",
                  ["get", "STATE_NAME"],
                  ["literal", Array.from(visitedStates)],
                ],
                "#627BC1",
                "#627BC1",
              ],
              "fill-opacity": [
                "case",
                ["==", ["get", "STATE_NAME"], hoveredStateId ?? ""],
                0.48,
                [
                  "in",
                  ["get", "STATE_NAME"],
                  ["literal", Array.from(visitedStates)],
                ],
                0.32,
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

        {/* Image location markers */}
        {visitedLocations.map((location, index) => (
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
              onClick={() => {
                if (currentManualAssignment) return;
                setSelectedImage(location);
              }}
            >
              📸
            </div>
          </Marker>
        ))}
      </Map>

      {currentManualAssignment && (
        <ManualAssignPanel>
          <ManualAssignText>
            Choose a state by clicking the map. The exact click location is what
            will be saved and uploaded.
          </ManualAssignText>
          <SkipButton onClick={handleSkipManualAssignment}>Not now</SkipButton>
        </ManualAssignPanel>
      )}

      <ControlsDock>
        <DisabledZoomOutButton
          onClick={handleZoomOut}
          disabled={Boolean(currentManualAssignment)}
        >
          Reset View
        </DisabledZoomOutButton>
        <AddImagesButton
          onClick={handleAddImages}
          disabled={Boolean(currentManualAssignment)}
        >
          Add Images
        </AddImagesButton>
      </ControlsDock>
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        disabled={Boolean(currentManualAssignment)}
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
