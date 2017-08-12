import AppSetup from './AppSetup.js';

import {Platform} from 'react-native';
import Config from 'react-native-config'

const API_URL = Config.API_URL;

class TtgApi {
  constructor(onRegister, onNotification, onError) {
    this._setup = new AppSetup();
    this._errorCallback = onError;
    this._id = null;
    this._setup.setupNotifications(
      function(id, token) {
        this.sendToken(id, token)
        .then(function() {
          this._id = id;
          onRegister();
        })
        .catch(error => onError(error))
      }.bind(this),
      onNotification
    );
  }

  scheduleTrip(origin, dest, route, transport, inputTs, inputDateString, waitingWindow, repeats) {
    let url = API_URL+"/api/schedule-trip";
    let body = {
      "user": {"user_id":this._id},
      "origin": {
        "lat": origin.lat, "lng": origin.lng
      },
      "destination": {
        "lat":dest.lat, "lng":dest.lng
      },
      "transport_type": transport,
      "input_arrival_time": {
        'timestamp': inputTs,
        'local_date_string': inputDateString
      },
      "route": route,
      "waiting_window": waitingWindow,
      "repeat_days": repeats
    }
    return new Promise(function(resolve, reject) {
      fetch(url, {
        method: "POST",
        body: JSON.stringify(body)
      })
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        if (responseJson.error !== null) {
          console.log(responseJson.error);
          reject(responseJson.error);
        } else {
          resolve(responseJson);
        }
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
    });
  }

  getScheduledTrips() {
    let url = API_URL+"/api/get-scheduled-trips?user_id="+this._id;
    return new Promise(function(resolve, reject) {
      fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        if (responseJson.error === null) {
          resolve(responseJson.trips);
        } else {
          console.log(responseJson.error);
          reject(responseJson.error);
        }
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
    });
  }

  getRoutes(origin, dest, transport, arrivalTime, routeName) {
    let base = API_URL+"/api/get-routes";
    let originArgs = "origin_lat="+origin.lat+"&origin_lng="+origin.lng;
    let destArgs = "dest_lat="+dest.lat+"&dest_lng="+dest.lng;
    let transportArgs = "transport_type="+transport+"&arrival_time="+arrivalTime;
    var url = base + "?" + originArgs + "&" + destArgs + "&" + transportArgs;
    if (routeName !== undefined) url += "&route_name="+routeName;
    return new Promise(function(resolve, reject) {
      fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
    });
  }

  sendToken(userId, token) {
    this._id = userId;
    let url = API_URL+"/api/register-user";
    let body = {
      "user_id": userId,
      "notification_token": token,
      "device_os": Platform.OS
    };
    return new Promise(function(resolve, reject) {
      fetch(url, {
        method: "POST",
        body: JSON.stringify(body)
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
    });
  }

  enableDisableTrip(id) {
    let url = API_URL+"/api/enable-disable-trip";
    return new Promise(function(resolve, reject) {
      fetch(url, {
        method: "POST",
        body: JSON.stringify({'trip_id': id, 'user': {'user_id': this._id}})
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
    });
  }

  deleteTrip(id) {
    let url = API_URL+"/api/delete-trip";
    return new Promise(function(resolve, reject) {
      fetch(url, {
        method: "DELETE",
        body: JSON.stringify({'trip_id': id, 'user': {'user_id': this._id}})
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
    });
  }
}

export default TtgApi;
