"use client";

import React, { createContext, useContext, useState } from "react";

export interface VisitedLocation {
  id?: string;
  lat: number;
  lng: number;
  filename: string;
  dataUrl?: string;
}

interface MapStateContextType {
  visitedStates: Set<string>;
  setVisitedStates: React.Dispatch<React.SetStateAction<Set<string>>>;
  visitedLocations: VisitedLocation[];
  setVisitedLocations: React.Dispatch<React.SetStateAction<VisitedLocation[]>>;
}

const MapStateContext = createContext<MapStateContextType | undefined>(
  undefined,
);

export function MapStateProvider({ children }: { children: React.ReactNode }) {
  const [visitedStates, setVisitedStates] = useState<Set<string>>(new Set());
  const [visitedLocations, setVisitedLocations] = useState<VisitedLocation[]>(
    [],
  );

  return (
    <MapStateContext.Provider
      value={{
        visitedStates,
        setVisitedStates,
        visitedLocations,
        setVisitedLocations,
      }}
    >
      {children}
    </MapStateContext.Provider>
  );
}

export function useMapState() {
  const context = useContext(MapStateContext);
  if (!context) {
    throw new Error("useMapState must be used within MapStateProvider");
  }
  return context;
}
