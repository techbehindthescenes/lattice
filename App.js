import React, { Component } from 'react';
import { Navigator } from './Navigator';

export default class App extends Component {
  render() {
    console.log('Starting anew....');
    return (
        <Navigator navigation={this.props.navigation}/>
    );
  }
}

App.router = Navigator.router;