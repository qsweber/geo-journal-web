"use client";

import React, { createContext, useContext, useState } from "react";

interface MapStateContextType {
  clickedStates: Set<string>;
  setClickedStates: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const MapStateContext = createContext<MapStateContextType | undefined>(
  undefined,
);

export function MapStateProvider({ children }: { children: React.ReactNode }) {
  const [clickedStates, setClickedStates] = useState<Set<string>>(new Set());

  return (
    <MapStateContext.Provider value={{ clickedStates, setClickedStates }}>
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
