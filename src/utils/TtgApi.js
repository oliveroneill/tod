import AppSetup from './AppSetup.js';

import {Platform} from 'react-native';
import Config from 'react-native-config'

const API_URL = Config.API_URL;

class TtgApi {
  /**
   * @param setup - optional argument for custom app setup, mainly used for
   * testing
  */
  constructor(setup) {
    if (setup === undefined)
      this._setup = new AppSetup();
    else
      this._setup = setup;
    this._id = null;
  }

  setup(onRegister, onNotification, onError) {
    this._setup.setupNotifications(
      function(id, token) {
        this._id = id;
        this.sendToken(id, token)
        .then(function() {
          onRegister();
        })
        .catch(error => onError(error))
      }.bind(this),
      onNotification,
      onError
    );
  }

  scheduleTrip(origin, dest, route, transport, inputTs, inputDateString, waitingWindowMs, repeats) {
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
      "waiting_window_ms": waitingWindowMs,
      "repeat_days": repeats
    }
    return new Promise(function(resolve, reject) {
      if (this._rejectWhenNotSetup(reject)) {
        return;
      }
      fetch(url, {
        method: "POST",
        body: JSON.stringify(body)
      })
      .then(TtgApi._handleResponse)
      .then(function(response) {
        resolve(response)
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
    }.bind(this));
  }

  getScheduledTrips() {
    let url = API_URL+"/api/get-scheduled-trips?user_id="+this._id;
    return new Promise(function(resolve, reject) {
      if (this._rejectWhenNotSetup(reject)) {
        return;
      }
      fetch(url)
      .then(TtgApi._handleResponse)
      .then(function(response) {
        return response.json();
      })
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
    }.bind(this));
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
      .then(TtgApi._handleResponse)
      .then(function(response) {
        return response.json();
      })
      .then((responseJson) => {
        resolve(responseJson);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
    }.bind(this));
  }

  sendToken(userId, token) {
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
      .then(TtgApi._handleResponse)
      .then(function(response) {
        resolve(response)
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
    }.bind(this));
  }

  enableDisableTrip(id) {
    let url = API_URL+"/api/enable-disable-trip";
    return new Promise(function(resolve, reject) {
      if (this._rejectWhenNotSetup(reject)) {
        return;
      }
      fetch(url, {
        method: "POST",
        body: JSON.stringify({'trip_id': id, 'user': {'user_id': this._id}})
      })
      .then(TtgApi._handleResponse)
      .then(function(response) {
        resolve(response)
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
    }.bind(this));
  }

  deleteTrip(id) {
    let url = API_URL+"/api/delete-trip";
    return new Promise(function(resolve, reject) {
      if (this._rejectWhenNotSetup(reject)) {
        return;
      }
      fetch(url, {
        method: "DELETE",
        body: JSON.stringify({'trip_id': id, 'user': {'user_id': this._id}})
      })
      .then(TtgApi._handleResponse)
      .then(function(response) {
        resolve(response)
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
    }.bind(this));
  }

  _rejectWhenNotSetup(reject) {
    if (this._id === null) {
      reject("Call setup() before making API requests")
      return true;
    }
    return false;
  }

  static _handleResponse(response) {
    if (TtgApi._isValidResponse(response)) {
      return response;
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

  static _isValidResponse(response) {
    return response.status >= 200 && response.status < 300;
  }
}

export default TtgApi;
