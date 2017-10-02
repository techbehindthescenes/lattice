import { Alert, AsyncStorage } from 'react-native';
import axios from 'axios';
import { constants } from './config';

class Service {
  constructor() {
    let service = axios.create({
        baseURL: constants.BACKEND_BASE_URL,
        timeout: constants.TIMEOUT,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    service.interceptors.response.use(this.handleSuccess, this.handleError);
    this.service = service;
  }

  handleSuccess(response) {
    return response; 
  }

  handleError = (error) => {
    console.error('Request failed: ' + error);

    if (error.response) {
        // Request was made but server responded with something
        // other than 2xx
        console.error('Status:',  error.response.status);
        console.error('Data:',    error.response.data);
        console.error('Headers:', error.response.headers);
        switch (error.response.status) {
            case 401:
              //this.redirectTo(document, '/')
              break;
            case 404:
              //this.redirectTo(document, '/404')
              break;
            default:
              //this.redirectTo(document, '/500')
              break;
        }
    } else {
        // Something else happened while setting up the request
        // triggered the error
        console.error('Error Message: ', error.message);
    }
    return Promise.reject(error.response || error.message);
  }

  /* UNUSED- remove later
  redirectTo = (document, path) => {
    document.location = path
  }
  */

  //generic APIs
  get(path, callback) {
    return this.service.get(path).then(
      (response) => callback(response.status, response.data)
    );
  }

  patch(path, payload, callback) {
    return this.service.request({
      method: 'PATCH',
      url: path,
      responseType: 'json',
      data: payload
    }).then((response) => callback(response.status, response.data));
  }

  post(path, payload, callback) {
    return this.service.request({
      method: 'POST',
      url: path,
      responseType: 'json',
      data: payload
    }).then((response) => callback(response.status, response.data));
  }

  delete(path, payload, callback) {
    return this.service.request({
      method: 'DELETE',
      url: path,
      responseType: 'json',
      data: payload
    }).then((response) => callback(response.status, response.data));
  }

  //THIS IS BROKEN
  checkAuth() {
    return AsyncStorage.getItem('jwt-ant', (err, token) => {
        if (err) {
            console.error('Received error retrieving jwt: ' + err);
           // return null;
        }
        console.log('Service found existing token: ' + JSON.parse(token));    
        this.service.defaults.headers.common['authorization'] = JSON.parse(token);
    });
  }

  // specific APIs - consider breaking out into separate classes
  handleLogOut() {
    //this.checkAuth();
    return this.delete('/logout', null, function(status, data) {
        AsyncStorage.removeItem('jwt-ant');
        console.log('Successful logout.');
    });
  }

  handleLogIn(payload) {
    //this.checkAuth();
    return this.post('/login', payload, function(status, data) {
        //AsyncStorage.removeItem('jwt-ant');
        //console.log(JSON.stringify(data.refreshToken));
        console.log('logged in and recd token: ' + JSON.stringify(data.refreshToken));
        AsyncStorage.setItem('jwt-ant', JSON.stringify(data.refreshToken));
        console.log('Successful login.');
    });
  }

  handleGetAnts() {
    console.log('calling handle ants');
    /*
    return this.checkAuth.then((callback) => {
      console.log('done checking existing tokens, retrieving ant data')
      this.get('/ant', null, callback);
    });
    */
    return AsyncStorage.getItem('jwt-ant', (err, token) => {
      if (err) {
          console.error('Received error retrieving jwt: ' + err);
         // return null;
      }
      console.log('Service found existing token: ' + JSON.parse(token));      
      this.service.defaults.headers.common['authorization'] = JSON.parse(token);
      console.log('done checking existing tokens, retrieving ant data')
    })
    .then(() => {
      return this.get('/ant', function(status, data) { 
        console.log('returned async call with payload: ' + JSON.stringify(data));
        return data;
      });
  });
  }

  //method to handle turning light on, off
  //param id is the string id of the ant -- TODO - not yet implemented
  // param request is a string from the enum: ["on", "off", "status"]
  //param request to support "true" = on? and "false" = off?
  handleLightSwitch(id, request) {
    //return checkAuth()
    //.then(() => {
      switch (request) {

        case 'status':
          console.log('calling light status for ant id ' + id + 'for request: ' + request);      
          url = '/ant/' + id + '/ledStatus';
          console.log('calling url to retrieve led status: ' + url);
          return this.get(url, function(status, data) { 
            console.log('returned async light status call with payload: ' + JSON.stringify(data));
            return data;
          });

        default:  // either on or off
          console.log('calling light switch for ant id ' + id + 'for request: ' + request);      
          url = '/ant/' + id + '/blinkLight/' + request;
          return this.post(url, null, function(status, data) { 
            console.log('returned async light on/off with data type: ' + typeof(data));
            console.log('returned async light on/off call with payload: ' + JSON.stringify(data));
            return data;
          });
      }

      //Need error handling for 404's- unknown/not found ID's
      
    //});
  }
  
}

export default new Service;