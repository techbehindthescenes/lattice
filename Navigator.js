import React from 'react';
import { Platform, StatusBar, Text } from 'react-native';
import { DrawerNavigator, StackNavigator } from 'react-navigation';
import Login from './Login';
import MapWithMarkers from './MapWithMarkers';
import Icon from 'react-native-vector-icons/FontAwesome';

  // login stack
export const LoginStack = StackNavigator({
    loginScreen: { screen: Login, navigationOptions: { header: null } },
    //signupScreen: { screen: Login },
    //forgottenPasswordScreen: { screen: Login, navigationOptions: { title: 'Forgot Password' } },
    //logoutScreen: { screen: Login },
  }, {
    headerMode: 'none',
    navigationOptions: {
      //headerStyle: {backgroundColor: 'blue'},
      //title: 'You are not logged in',
      //headerTintColor: 'white'
    }
  })

export const DrawerStack = DrawerNavigator({
    mapWithMarkers: { screen: MapWithMarkers },
    logout: { screen: LoginStack },
  }, {
    gesturesEnabled: false
})

//wrapper to main app stack with menu button
export const DrawerNavigation = StackNavigator({
    drawerStack: { screen: DrawerStack }
  }, {
      headerMode: Platform.OS === 'ios' ? 'float' : 'screen',
      navigationOptions: ({ navigation }) => ({
          headerStyle: {backgroundColor: 'blue', paddingLeft: 10},
          title: 'Map',
          headerTintColor: 'white',
          headerLeft: <Icon name='bars' size={24} color='white' onPress={() => {
            if (navigation.state.index === 0) {
              navigation.navigate('DrawerOpen')
            } else {
              navigation.navigate('DrawerClose')
            }
          }} />,
    })
})

export const Navigator = StackNavigator({
    loginStack: { screen: LoginStack },
    drawerNavigation: { screen: DrawerNavigation }
  }, {
    // Default config for all screens
    headerMode: 'none',
    title: 'Main',
    gesturesEnabled: false,
    //initialRouteName: 'loginStack',
    cardStyle: {
      paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight
    },
  })
  