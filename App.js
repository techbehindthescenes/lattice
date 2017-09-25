import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MapView } from 'expo';
let id = 0;

export default class App extends React.Component {
  render() {
    return (
        <MapWithMarkers/>
    );
  }
}

class MapWithMarkers extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }
 
  getInitialState() {
    return {
      region: {
        latitude: 42.324094,
        longitude: -71.384572,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      markers: [ 
        {
          coordinate: { 
            latitude: 42.324094,
            longitude: -71.384572, 
          },
          key: id++,
          title: 'Home 1',
          description: 'backyard',
          color: '#ababac',
        },
        {
          coordinate: { 
            latitude: 42.3009,
            longitude: -71.3842, 
          },
          key: id++,
          title: 'Natick Mall',
          description: 'Natick Mall',
          color: '#ababac',
        },
      ],
      popupIsOpen: false,
    };
  }
  
  onRegionChange(region) {
    this.setState({ region });
  }  

  onMapPress(e) {
    this.setState({
      markers: [
        ...this.state.markers,
        {
          coordinate: e.nativeEvent.coordinate,
          key: id++,
          color: '#ababab',
        },
      ],
    });
  }

  showMarkerCallout = (marker) => {
    marker.showCallout();
  }

  hideMarkerCallout = (marker) => {
    marker.hideCallout();
  }

  openMarker = (marker) => {
    this.setState({
        popupIsOpen: true,
        marker,
    });
  }

  closeMarker = () => {
    this.setState({
      popupIsOpen: false,
    });
  }
  
  render() {
    return (
      <View style={styles.container}>
        <MapView
          provider={this.props.provider}
          style={styles.map}
          region={this.state.region}
          //initialRegion={this.state.region}
          onRegionChange={(r) => this.onRegionChange(r)}
          onPress={(e) => this.onMapPress(e)}
        >
          {this.state.markers.map(marker => (
            <MapView.Marker
              key={marker.key}
              coordinate={marker.coordinate}
              pinColor={marker.color}
              onPress={ (marker) => showMarkerCallout(marker) }
              onCalloutPress={ (marker) => hideMarkerCallout(marker) }
            >
              <MapView.Callout style={styles.plainView}>
                <View>
                  <Text>Example Callout</Text>
                </View>
              </MapView.Callout>
            </MapView.Marker>
          ))}
        </MapView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => this.setState({ markers: [] })}
            style={styles.bubble}
          >
            <Text>Tap to clear markers</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

MapWithMarkers.propTypes = {
  provider: MapView.ProviderPropType,
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  plainView: {
    width: 60,
  },
});