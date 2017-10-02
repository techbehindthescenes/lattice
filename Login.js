import React, { Component } from 'react';
import { Alert, AsyncStorage, Image, KeyboardAvoidingView, ScrollView, StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import { constants } from './config';
import axios from 'axios';
import Service from './Service';
import MapWithMarkers from './MapWithMarkers';
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';

var t = require('tcomb-form-native');
var _ = require('lodash');
var Form = t.form.Form;

//Special form element types with Regex Validation
const Email = t.subtype(t.String, (email) => {
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(email);
});

const Password = t.subtype(t.String, (password) => {
    const reg2 = /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{8,40})$/;
    return reg2.test(password);
});

//Application-specific Form types
var signInUser = t.struct({
    email: Email, //t.String,
    password: t.String // Password,  //change back in production
});
  
var signUpUser = t.struct({
    first_name: t.String,
    last_name: t.String,
    email: Email, //t.String,
    password: t.String // Password,  //change back in production
});

// clone the default stylesheet
const stylesheet = _.cloneDeep(t.form.Form.stylesheet);

// overriding the form input box styling
stylesheet.textbox.normal.height = 60;
stylesheet.textbox.error.height = 60;

var options = {
    auto: 'placeholders',
    fields: {
        password: {
            password: true,
            secureTextEntry: true,
            error: 'Password must be 8-40 characters with a number, capital, and special character',
        },
        email: {
            keyboardType: 'email-address',
            autoCorrect: false,
            autoCapitalize: 'none',
            error: 'Please enter a valid email',
        },
        first_name: {
            autoCorrect: false,
        },
        last_name: {
            autoCorrect: false,
        },
    },
    stylesheet: stylesheet,
};

export default class Login extends Component {

    static navigationOptions = {
        drawerLabel: 'Logout',
        drawerIcon: <Icon name='user-o' size={24} color='blue' />
      };

    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }
        
    getInitialState() {
        return {
            options: options,
            value: null,
            isLoggedIn: false,
            isLoading: false,
            hasErrored: false,
        };
    }

    onChange(value) {
        this.setState({value: value});
    }

    clearForm() {
        // clear content from form
        this.setState({ value: null });
    }

    handleSubmit() {
        var value = this.refs.form.getValue()
        if (value) {
          //received form
          console.log('new form submission');
          const formdata = {
            email: value.email,
            password: value.password,
            first_name: value.first_name,
            last_name: value.last_name
          }
          // Serialize and post the data
          const json = JSON.stringify(formdata);
          
          // Verify on remote server
          this.setState({ isLoading: true });

          //TODO - figure isLoading/hasErrored and error handling 
        Service.handleLogIn(json)
            .then(() => {
                this.setState({ isLoggedIn: true });
                console.log('Nav Props: ' + JSON.stringify(this.props.navigation));
                //this.props.navigation('drawerNavigation');
                this.props.navigation.dispatch(
                    NavigationActions.navigate({ 
                        routeName: 'drawerNavigation', 
                    })
                )
            })
            .catch((error) => {
                console.error('error logging in: ' + error);
                this.setState({ hasErrored: true });
            })
          // clear all fields after submission
          this.clearForm();
        } else {
            Alert.alert('Please fix the errors listed and try again.')
        }
    }

    render() {
      const { navigate } = this.props.navigation;
//      var image = require('./assets/Blossoms.jpg');
      //<Image source={image} resizeMode='contain' style={styles.image}/>
      if ( this.state.hasErrored )
      {
        return <View style={styles.container}><Text>Sorry we were not able to login at this time.</Text></View>
      }
      if ( this.state.isLoading )
      {
        return <View style={styles.container}><Text>Logging in...</Text></View>
      }
      /*
      if ( this.state.isLoggedIn )
      {
        //return ( <View><Text>congrats, you are logged in.</Text></View> );
        return ( navigate('drawerStack') );
      }
      */
      return (
        <KeyboardAvoidingView behavior='padding' style={styles.container}>
            <View style={styles.formContainer}>
                    <Form
                    ref="form"
                    type={signInUser}
                    options={this.state.options}
                    value={this.state.value}
                    onChange={this.onChange.bind(this)}
                    />
                <TouchableHighlight
                    style={styles.button}
                    onPress={this.handleSubmit.bind(this)}
                    underlayColor='#99d9f4'>
                    <Text style={styles.buttonText}>LOG IN</Text>
                </TouchableHighlight>
            </View>
        </KeyboardAvoidingView>
    );
  }
}

var styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      padding: 20,
      backgroundColor: 'white',
      flex: 1,
    },
    formContainer: {
      justifyContent: 'flex-end',
      flex: 1,
      marginBottom: 20,
    },
    buttonText: {
      fontSize: 18,
      color: 'white',
      alignSelf: 'center'
    },
    button: {
      height: 60,
      backgroundColor: 'blue',
      borderColor: 'blue',
      borderWidth: 1,
      borderRadius: 4,
      marginBottom: 10,
      alignSelf: 'stretch',
      justifyContent: 'center'
    },
    image: {
        flex: 2,
        marginBottom: 10,
        alignSelf: 'center',
        borderRadius: 4,                 // rounded corners
    },
  });