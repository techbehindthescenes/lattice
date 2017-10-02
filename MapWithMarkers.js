import React, { Component } from 'react';
import { Alert, AsyncStorage, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MapView } from 'expo';
import MarkerPopup from './MarkerPopup';
import Login from './Login';
import { ants } from './data';
//import axios from 'axios';
import Service from './Service';
import Icon from 'react-native-vector-icons/FontAwesome';

/*
/////TODO
Remove ants manual loading
update markers2 -> markers
Fix weird alert popup that sometimes appears on loading
Remove AsyncStorage from imports
Add logic to determine pincolor
Remove ability to add ants via long press
Update hard coded logic for starting location
Complete and/or remove isLoggedIn checks
*/


let _counterid = 0;  //used to uniquely index markers. remove once markers created with uuids.
const _pinColor = 'blue';
const _coord = {
  coordinate: { 
    latitude: 42.3009,
    longitude: -71.3842, 
  },
}

export default class MapWithMarkers extends Component {
  static navigationOptions = {
    drawerLabel: 'Map',
    drawerIcon: <Icon name='map-o' size={24} color='blue' />
  };

  constructor(props) {
    super(props);
    console.log('initializing MapWithMarkers');
    this.state = this.getInitialState();
    this.fetchMarkers = this.fetchMarkers.bind(this);
    this.render = this.render.bind(this);
  }
 
  getInitialState() {
    console.log('fetching initial state of MapWithMarkers');
    return {
      region: {
        latitude: 42.324094,
        longitude: -71.384572,
        latitudeDelta: 0.0006,
        longitudeDelta: 0.0008,
      },
      markers: ants,  //set markers to values in the ants file
      markers2: [],
      popupIsOpen: false,
      hasErrored: false,
      isLoading: false,
      latlng: {
        latitude: 42.324094,
        longitude: -71.384572,
      },
      isLoggedIn: false,
    };
  }

  fetchMarkers() {
    this.setState({ isLoading: true });
    console.log('fetching markers');
    Service.handleGetAnts()
    .then((data) => {
      console.log('got docs back: ' + JSON.stringify(data));
      this.setState({ isLoading: false });
      this.setState({ markers2: data.docs });
      console.log('state for markers2 is : ' + JSON.stringify(this.state.markers2));
    })
      .catch((error) => {
          console.error('remote request errored: ' + error);
          console.log('updating hasErrored state');
          this.setState({ hasErrored: true });
      })
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => this.setState({
        region: {
          ...this.state.region,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
      }),
      error => alert(JSON.stringify(error)), {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    );
    this.fetchMarkers();  //get list of current ants
  }
  
  onRegionChange(region) {
    this.setState({ region });
  }  

  onLongMapPress(e) {
    this.setState({
      markers: [
        ...this.state.markers,
        {
          _id: _counterid++,
          name: 'New ant ' + _id,
          description: JSON.stringify(e.nativeEvent.coordinate),
          coordinate: e.nativeEvent.coordinate,
          latitude: e.nativeEvent.coordinate.latitude,
          longitude: e.nativeEvent.coordinate.longitude,
          color: _pinColor,
          isActive: false,
          status: 'User Requested',
          radius: 0,
        },
      ],
    });
  }

  logMarkerCalloutPress = (e, key) => {
    console.log('logging marker callout press' + key);
    this.setState({selectedMarkerCalloutKey: key});
  }

  openMarker = (e, key) => {
    console.log('logging marker open press' + key);
    this.setState({
        popupIsOpen: true,
        selectedMarkerKey: key,
    });
  }

  openAndSelectMarker = (e, marker) => {
    console.log('logging marker open press' + marker.id);
    this.setState({
        popupIsOpen: true,
        selectedMarker: marker,
        selectedMarkerKey: marker.id,
    });
  }

  closeMarker = () => {
    this.setState({
      popupIsOpen: false,
    });
  }

  render() {

    /*
    if (!this.state.isLoggedIn) {
      return <Login/> //replace with navigator
    }
  */

    if (this.state.hasErrored) {
      return <View style={styles.container}><Text>Sorry! We could not load this application.</Text></View>;
    }

    if (this.state.isLoading) {
      return <View style={styles.container}><Text>Loading</Text></View>;
    }
    return (
      <View style={styles.container}>
        <MapView
          provider={this.props.provider}
          style={styles.map}
          //region={this.state.region}
          //maxZoomLevel={'10'}
          showsUserLocation={true}
          //followsUserLocation={true}
          initialRegion={this.state.region}
          moveOnMarkerPress={false} //Android only
          onRegionChange={(r) => this.onRegionChange(r)}
          //onPress={(e) => this.onMapPress(e)}
          onLongPress={(e) => this.onLongMapPress(e)}
        >
          {this.state.markers2.map(marker => (
            <MapView.Marker
              key={marker._id}
              coordinate={ 
                {
                  latitude: marker.latitude,
                  longitude: marker.longitude
                }
              }
              pinColor={_pinColor}
              onCalloutPress={(e) => this.openAndSelectMarker(e, marker)}
            >
              <MapView.Callout>
                <View>
                  <Text>{marker.name} at {marker.latitude} by {marker.longitude}</Text>
                </View>
              </MapView.Callout>
            </MapView.Marker>
          ))}
        </MapView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => this.setState(this.getInitialState()) }
            style={styles.bubble}
          >
            <Text>Tap to reset</Text>
          </TouchableOpacity>
        </View>
        <MarkerPopup
          //markerKey={this.state.selectedMarkerKey}
          selectedMarker={this.state.selectedMarker}
          isOpen={this.state.popupIsOpen}
          onClose={this.closeMarker}
        />
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
});