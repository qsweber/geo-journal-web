import { Component } from "react";
import { Map as BaseMap } from "mapbox-gl";
import ReactMapGL, {
  ViewportProps,
  MapLoadEvent,
  PointerEvent,
  Source,
  Layer,
} from "react-map-gl";

interface State {
  hoveredStateId: string | undefined;
  viewport: ViewportProps;
  map: BaseMap | undefined;
}

interface Props {
  stateNames: string[];
}

class Map extends Component<Props, State> {
  state: State = {
    viewport: {
      width: "100vw" as any,
      height: "100vh" as any,
      latitude: 41.5868,
      longitude: -93.625,
      zoom: 3,
    } as any,
    hoveredStateId: undefined,
    map: undefined,
  };

  render() {
    return (
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
                  ["literal", this.props.stateNames],
                ],
                1,
                ["boolean", ["feature-state", "qsw"], false],
                0.75,
                0.5,
              ],
            }}
          />
          <Layer
            id="state-borders"
            type="line"
            source="states"
            paint={{
              "line-color": "#627BC1",
              "line-width": 1,
            }}
          />
        </Source>
      </ReactMapGL>
    );
  }
}

export default Map;
