import React, { Component, ReactNode } from "react";
import { Map as BaseMap } from "mapbox-gl";
import ReactMapGL, {
  ViewportProps,
  MapLoadEvent,
  PointerEvent,
  Source,
  Layer,
  Marker,
} from "react-map-gl";
import { ImageAndLocations } from "../interfaces";

interface State {
  hoveredStateId: string | undefined;
  viewport: ViewportProps;
  map: BaseMap | undefined;
}

interface Props {
  chilren?: ReactNode;
  images: ImageAndLocations[];
}

const imgStyle = {
  width: "50px",
  borderRadius: "10px",
  border: "1px solid black",
};

class Map extends Component<Props, State> {
  state: State = {
    viewport: {
      width: "100vw - 8px",
      height: "92vh",
      latitude: 41.5868,
      longitude: -93.625,
      zoom: 4,
    } as any,
    hoveredStateId: undefined,
    map: undefined,
  };

  render() {
    return (
      <div>
        <ReactMapGL
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxApiAccessToken="pk.eyJ1IjoicXN3ZWJlciIsImEiOiJjam5nZTZuazgwMTlkM2twYXpjYmpqeTBjIn0.viU-jQrjmOf40aONFwjQdQ"
          onViewportChange={(viewport: ViewportProps) =>
            this.setState({ viewport })
          }
          {...this.state.viewport}
          onLoad={(event: MapLoadEvent) => {
            this.setState({ map: event.target }); // is there a better way to do this?
          }}
          onHover={(event: PointerEvent) => {
            if (event.features) {
              const stateFeature = event.features.find(
                (feature) => feature.layer.id === "state-fills"
              );
              if (stateFeature) {
                this.state.map?.setFeatureState(stateFeature, { qsw: true });
              }
            }
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
                  [
                    "in",
                    ["get", "STATE_NAME"],
                    ["literal", this.props.images.map((i) => i.region)],
                  ],
                  0.3,
                  ["boolean", ["feature-state", "qsw"], false],
                  0,
                  0,
                ],
              }}
            />
            {this.props.images.map((image, i) => (
              <Marker
                latitude={image.coordinates.latitude}
                longitude={image.coordinates.longitude}
                offsetLeft={-25}
                offsetTop={-25}
                key={`${i}`}
              >
                <img style={imgStyle} src={image.imgSrc} />
              </Marker>
            ))}
          </Source>
          {this.props.children}
        </ReactMapGL>
      </div>
    );
  }
}

export default Map;
