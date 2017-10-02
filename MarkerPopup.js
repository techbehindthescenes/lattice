/*
Attribution: http://rationalappdev.com/movie-tickets-booking-app-with-react-native/#data
*/
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  LayoutAnimation,
  PanResponder,
  Platform,
  PlatformOSType,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Service from './Service';

const { width, height } = Dimensions.get('window');
//Set default popup height to 67% of the screen height
const defaultHeight = height * 0.67;
//To support layout animation on Android, though not yet working
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export default class MarkerPopup extends Component {

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    selectedMarker: PropTypes.object,
    onClose: PropTypes.func,
  }

  state = {
     // Animates slide ups and downs when popup open or closed
     position: new Animated.Value(this.props.isOpen ? 0 : height),
     // Backdrop opacity
     opacity: new Animated.Value(0),
     // Popup height that can be changed by pulling it up or down
     popupHeight: defaultHeight,
     // Expanded mode with bigger poster flag
     expanded: false,
     // Visibility flag
     visible: this.props.isOpen,
     lightSwitch: false // this.props.selectedMarker ? this.getSwitchValue(this.props.selectedMarker._id) : false,
     //isActive: true, //this.props.selectedMarker.isActive,  ARGH - CANNOT GET THIS TO WORK
     //hasWarning: false, // this.props.selectedMarker.hasWarning, ARGH - CANNOT GET THIS TO WORK
  };

  // When user starts pulling popup previous height gets stored here
  // to help us calculate new height value during and after pulling
  _previousHeight = 0

  componentWillMount() {
    console.log('calling Component Will Mount');
    console.log('marker popup state is currently' + JSON.stringify(this.state));
    // Initialize PanResponder to handle move gestures
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        // Ignore taps
        if (dx !== 0 && dy === 0) {
          return true;
        }
        return false;
      },
      onPanResponderGrant: (evt, gestureState) => {
        // Store previous height before user changed it
        console.log('Gesture started');
        this._previousHeight = this.state.popupHeight;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Pull delta and velocity values for y axis from gestureState
        const { dy, vy } = gestureState;
        // Subtract delta y from previous height to get new height
        let newHeight = this._previousHeight - dy;
        console.log('New height is ' + newHeight);

        // Animate height change so it looks smooth
        LayoutAnimation.easeInEaseOut(); //NOT WORKING ON ANDROID

        // Switch to expanded mode if popup pulled up above 80% mark
        if (newHeight > height - height / 5) {
          console.log('height raised- should fully expand');
          this.setState({ expanded: true });
        } else {
          this.setState({ expanded: false });
        }

        // Expand to full height if pulled up rapidly
        if (vy < -0.75) {
          this.setState({
            expanded: true,
            popupHeight: height
          });
        }

        // Close if pulled down rapidly
        else if (vy > 0.75) {
          this.props.onClose();
        }
        // Close if pulled below 75% mark of default height
        else if (newHeight < defaultHeight * 0.75) {
          this.props.onClose();
        }
        // Limit max height to screen height
        else if (newHeight > height) {
          this.setState({ popupHeight: height });
        }
        else {
          this.setState({ popupHeight: newHeight });
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => {
        console.log('gesture failed to complete');
        return true;
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dy } = gestureState;
        const newHeight = this._previousHeight - dy;
        console.log('New height set: ' + newHeight);
        // Close if pulled below default height
        if (newHeight < defaultHeight) {
          this.props.onClose();
        }

        // Update previous height
        this._previousHeight = this.state.popupHeight;

      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  // Handle isOpen changes to either open or close popup
  componentWillReceiveProps(nextProps) {
    const {
      selectedMarker,
    } = nextProps;

    const { _id } = selectedMarker || {};
    console.log('Ant _id: ' + _id);

    console.log('calling Component Will Receive Props on nextProps: ' + JSON.stringify({_id}) );
    // isOpen prop changed to true from false
    if (!this.props.isOpen && nextProps.isOpen) {
      this.animateOpen();
    }
    // isOpen prop changed to false from true
    else if (this.props.isOpen && !nextProps.isOpen) {
      this.animateClose();
    }

    if (_id)
    {
      this.getSwitchValue(_id);
      console.log('updating the switch value during componentwill receive props' ); 
    }
    
  }

  // Open popup
  animateOpen() {
    // Update state first
    this.setState({ visible: true }, () => {
      Animated.parallel([
        // Animate opacity
        Animated.timing(
          this.state.opacity, { toValue: 0.5 } // semi-transparent
        ),
        // And slide up
        Animated.timing(
          this.state.position, { toValue: 0 } // top of the screen
        ),
      ]).start();
    });
  }

  // Close popup
  animateClose() {
    Animated.parallel([
      // Animate opacity
      Animated.timing(
        this.state.opacity, { toValue: 0 } // transparent
      ),
      // Slide down
      Animated.timing(
        this.state.position, { toValue: height } // bottom of the screen
      ),
    ]).start(() => this.setState({
      // Reset to default values
      popupHeight: defaultHeight,
      expanded: false,
      visible: false,
    }));
  }

  getHeaderIcon() {
    if (this.state.expanded) {
      return <Icon name='angle-double-down' size={16} color='gray' />
    } 
    return <Icon name='angle-double-up' size={16} color='gray' />;
  }

  onWarningPress() {
    console.log('you tapped the signal button');
    Alert.alert('You tapped the Warning button! TODO- add what needs attention here.');
  }

  lightSwitchHandler(id, value) {
    //this.setState({ lightSwitch: value });
    (value) ? str = 'on' : str = 'off';
    Service.handleLightSwitch(id, str)
    .then((data) => {
      console.log('light switch turned ' + str);
      this.setState({ lightSwitch: value });
    })
    .catch((err) => { console.error('error turning light ' + str + ': ' + err)})
    //need to map value to on/off
    //TODO - callback to model to set light switch value; set state once Promise is resolved
  }

  //TODO - callback to model to get light switch value
  // return true means light (switch) is on; return false means light (switch) is off
  getSwitchValue(id) {
    console.log('checking light switch value with id: ' + id);
    Service.handleLightSwitch(id, 'status')
    .then((data) => { 
      console.log('Light switch value is: ' + JSON.stringify(data) + ' and non-string form ' + data);
      this.setState({ lightSwitch: data });
      //return data;
    })
    .catch((err) => { 
      console.error('error getting light status: ' + err); 
      //return false; 
    })
    //return false;
  }

  render() {
    // Render nothing if not visible
    const {
      selectedMarker,
    } = this.props;

    const { name, _id, description, dateFirstOnline, dateLastServiced, hasWarning, status } = selectedMarker || {};
    console.log('Ant ' + JSON.stringify({name}) + ' with _id: ' + JSON.stringify({_id}) + ' Has Warning: ' + {hasWarning}.hasWarning + ' and Ant isActive: ' + {status}.status );
    if (!_id) {
      return null;
    }
    
    if (!this.state.visible) {
      return null;
    }
    //this.setState({ lightSwitch: this.getSwitchValue(_id) });
    //this.state.lightSwitch = this.getSwitchValue(_id);
    console.log('has light switch value: ' + this.state.lightSwitch);
    //console.log('has warning type: ' + typeof {hasWarning} );
    //console.log('has warning compare: ' + {hasWarning} == 'true');
    var image = require('./assets/icons/loading-icon.png');
    //var hasWarningString = {hasWarning};
    //console.log(hasWarningString);


    return (
      <View style={styles.container}>
        {/* Closes popup if user taps on semi-transparent backdrop */}
        <TouchableWithoutFeedback onPress={this.props.onClose}>
          <Animated.View style={[styles.backdrop, { opacity: this.state.opacity }]}/>
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.modal, {
            // Animates height
            height: this.state.popupHeight,
            // Animates position on the screen
            transform: [{ translateY: this.state.position }, { translateX: 0 }]
          }]}
        >
          <View style={styles.content}>
            <View
                style={styles.markerContainer}
                {...this._panResponder.panHandlers}
            >
              <View style={styles.markerGripper}>
                <Icon name='bars' size={16} color='#BBBBBB'/>
                <Icon name='bars' size={16} color='#BBBBBB'/>
                <Icon name='bars' size={16} color='#BBBBBB'/>
              </View>
              <View style={{ margin: 5, flexDirection: 'row', justifyContent: 'space-between'}}>
                {
                  ({status}.status === 'Active') ? 
                    ( <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 20, }}>ACTIVE</Text>) 
                    : 
                    ( <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 20, }}>INACTIVE</Text> )
                }
                  { ( {hasWarning}.hasWarning ) &&
                      <TouchableOpacity onPress={this.onWarningPress} > 
                        <Icon name='warning' style={{ color: 'red', fontSize: 20, textAlign: 'right', textAlignVertical: 'bottom', }} />
                      </TouchableOpacity>
                  }
              </View>
              <View style={styles.summary} >
                <View>
                    <Image source={image} style={styles.image}/>
                </View>
                <View>
                  <Text style={styles.title}>{name}</Text>
                  <Text style={styles.description}>{description}</Text>
                  <View style={ styles.markerQuickies }>
                    <Icon name='signal' size={14} color='black' />
                    <Text> </Text>
                    <Icon name='battery' size={14} color='black' />
                  </View>
                </View>
              </View>
              <ScrollView contentContainerStyle={[styles.markerInnerBox, {flex: 1}]}>
                <View style={styles.markerLineItems}>
                  <Text>Light: </Text>
                  <Switch onValueChange={(value) => this.lightSwitchHandler(_id, value)} value={this.state.lightSwitch} />
                </View>
                <View style={styles.markerLineItems}>
                  <Text>Temperature: </Text>
                  <Text>80{'\u2109'}</Text>
                </View>
                <View style={styles.markerLineItems}>
                  <Text>Date Last Serviced: </Text>
                  <Text>{dateLastServiced}</Text>
                </View>
                <View style={styles.markerLineItems}>
                  <Text>Date First Online: </Text>
                  <Text>{dateFirstOnline}</Text>
                </View>
                <View style={styles.markerLineItems}>
                  <Text>Logs: </Text>
                  <Text ellipsizeMode='head' numberOfLines={4}>Lorem ipsum dolor sit amet, 
                    consectetur adipiscing elit, sed do eiusmod tempor 
                    incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco 
                    laboris nisi ut aliquip ex ea commodo consequat. 
                    Duis aute irure dolor in reprehenderit in voluptate 
                    velit esse cillum dolore eu fugiat nulla pariatur. 
                    Excepteur sint occaecat cupidatat non proident, 
                    sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
                </View>
                <View style={styles.markerLineItems}>
                  <Text>...More</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  // Main container
  container: {
    ...StyleSheet.absoluteFillObject,   // fill up all screen
    justifyContent: 'flex-end',         // align popup at the bottom
    backgroundColor: 'transparent',     // transparent background
  },
  // Semi-transparent background below popup
  backdrop: {
    ...StyleSheet.absoluteFillObject,   // fill up all screen
    backgroundColor: 'black',
    //opacity: 0.5,                     // set dynamically using Animated
  },
  // Popup
  modal: {
    //height: height / 2,                 // set dynamically using Animated
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    margin: 5,
    marginBottom: 0,
  },
  markerContainer: {
    flex: 1,                            // take up all available space
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  markerGripper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
  },
  summary: {
    margin: 5,
    //flex: 1,
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 20,
  },
  description: {
    paddingLeft: 10,
    paddingRight: 10,
    color: 'gray',
    fontSize: 14,
  },
  image: {
    borderRadius: 5,                 // rounded corners
    width: 80,
    height: 80,
  },
  markerInnerBox: {
    margin: 5,
    borderColor: '#BBBBBB',
    borderWidth: 1,
    padding: 5,
    paddingRight: 10,
    paddingLeft: 10,
    borderRadius: 10,
  },
  markerQuickies2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 38,
  },
  markerQuickies: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  markerLineItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //fontSize: 16,  //cannot use within a ScrollView, oddly
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    margin: 5,
  }
});