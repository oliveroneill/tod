import React from 'react';

import TodAPI from '../../src/utils/TodAPI.js';

describe('TodAPI', () => {
  beforeEach(() => {
    // Disable error logging since these tests generate errors on purpose
    // and this can be confusing looking at test output
    console.log = jest.fn()
  })

  // Setup tests

  it('sets up notifications and logs in on setup', (done) => {
    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        expect(url).toContain("/api/register-user");
        expect(request.method).toBe("POST");
        let body = JSON.parse(request.body);
        expect(body.user_id).toEqual(expectedToken);
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let onRegister = function() {
      expect(mockSetup).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      done();
    }
    let onError = jest.fn();
    let api = new TodAPI(setup);
    api.setup(onRegister, jest.fn(), onError);
  });

  it('errors when app setup fails', (done) => {
    let setup = {};
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onError();
    });
    let mockFetch = jest.fn().mockImplementation(() => {
      return new Promise(function(resolve, reject) {
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let onRegister = jest.fn();
    let onError = function() {
      expect(mockSetup).toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
      expect(onRegister).not.toHaveBeenCalled();
      done();
    }
    let api = new TodAPI(setup);
    api.setup(onRegister, jest.fn(), onError);
  });

  it('errors when login fails with network request failure', (done) => {
    let setup = {};
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken("test_token1");
    });
    let mockFetch = jest.fn().mockImplementation(() => {
      return new Promise(function(resolve, reject) {
        reject("Fake error");
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let onRegister = jest.fn();
    let onError = function() {
      expect(mockSetup).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
      expect(onRegister).not.toHaveBeenCalled();
      done();
    };
    let api = new TodAPI(setup);
    api.setup(onRegister, jest.fn(), onError);
  });

  // // Ensure request/response to server is handled properly

  it('correctly formats data for scheduleTrip request', (done) => {
    let origin = {lat: 99, lng: -23};
    let dest = {lat:45, lng: -90};
    let route = {"name":"bla"};
    let transport = "transit";
    let inputTs = 34232211;
    let inputDateString = "21st March 2011";
    let waitingWindowMs = 5000;
    let tzLoc = "Australia/Sydney";
    let repeats = [false, true, true, false, false, false];

    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain("/api/schedule-trip");
          expect(request.method).toBe("POST");
          let body = JSON.parse(request.body);
          expect(body.user.user_id).toEqual(expectedToken);
          expect(body.origin).toEqual(origin);
          expect(body.destination).toEqual(dest);
          expect(body.destination).toEqual(dest);
          expect(body.transport_type).toEqual(transport);
          expect(body.input_arrival_time.timestamp).toEqual(inputTs);
          expect(body.input_arrival_time.local_date_string).toEqual(inputDateString);
          expect(body.input_arrival_time.timezone_location).toEqual(tzLoc);
          expect(body.route).toEqual(route);
          expect(body.waiting_window_ms).toEqual(waitingWindowMs);
          expect(body.repeat_days).toEqual(repeats);
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.scheduleTrip(
        origin, dest, route, transport, inputTs, inputDateString,
        waitingWindowMs, tzLoc, repeats
      )
      .then((response) => {
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('correctly formats data and handles response for getRoutes request', (done) => {
    let origin = {lat: 99, lng: -23};
    let dest = {lat:45, lng: -90};
    let routeName = "Example Route 1";
    let transport = "transit";
    let inputTs = 34232211;
    let base = "/api/get-routes?origin_lat="+origin.lat+"&origin_lng="+origin.lng;
    let destArgs = "dest_lat="+dest.lat+"&dest_lng="+dest.lng;
    let transportArgs = "transport_type="+transport+"&arrival_time="+inputTs;
    var expectedUrl = base + "&" + destArgs + "&" + transportArgs;

    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain(expectedUrl);
        }
        resolve({json: function() {return {}}, status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.getRoutes(origin, dest, transport, inputTs, routeName)
      .then((response) => {
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('correctly handles response for getScheduledTrips', (done) => {
    let setup = {};
    let expectedToken = "test_token1";
    let expectedUrl = "/api/get-scheduled-trips?user_id="+expectedToken;
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain(expectedUrl);
        }
        resolve({json: function() {return {}}, status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.getScheduledTrips(expectedToken)
      .then((response) => {
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('correctly formats data for enableDisableTrip request', (done) => {
    let expectedTripId = "xyz123";
    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain("/api/enable-disable-trip");
          expect(request.method).toBe("POST");
          let body = JSON.parse(request.body);
          expect(body.user.user_id).toEqual(expectedToken);
          expect(body.trip_id).toEqual(expectedTripId);
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.enableDisableTrip(expectedTripId)
      .then((response) => {
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('correctly formats data for deleteTrip request', (done) => {
    let expectedTripId = "xyz123";
    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain("/api/delete-trip");
          expect(request.method).toBe("DELETE");
          let body = JSON.parse(request.body);
          expect(body.user.user_id).toEqual(expectedToken);
          expect(body.trip_id).toEqual(expectedTripId);
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.deleteTrip(expectedTripId)
      .then((response) => {
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  // Network error cases

  it('errors when calling scheduleTrip and network request fails', (done) => {
    let origin = {lat: 99, lng: -23};
    let dest = {lat:45, lng: -90};
    let route = {"name":"bla"};
    let transport = "transit";
    let inputTs = 34232211;
    let inputDateString = "21st March 2011";
    let waitingWindowMs = 5000;
    let repeats = [false, true, true, false, false, false];

    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain("/api/schedule-trip");
          expect(request.method).toBe("POST");
          reject("Network request failed");
          return;
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.scheduleTrip(
        origin, dest, route, transport, inputTs, inputDateString,
        waitingWindowMs, repeats
      )
      .catch((error) => {
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('errors when calling getRoutes and network request fails', (done) => {
    let origin = {lat: 99, lng: -23};
    let dest = {lat:45, lng: -90};
    let routeName = "Example Route 1";
    let transport = "transit";
    let inputTs = 34232211;

    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          reject("Network request failed");
          return;
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.getRoutes(origin, dest, transport, inputTs, routeName)
      .catch((error) => {
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('errors when calling getScheduledTrips and network request fails', (done) => {
    let setup = {};
    let expectedToken = "test_token1";
    let expectedUrl = "/api/get-scheduled-trips?user_id="+expectedToken;
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain(expectedUrl);
          reject("Network request failed");
          return;
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.getScheduledTrips(expectedToken)
      .catch((error) => {
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('errors when calling enableDisableTrip and network request fails', (done) => {
    let expectedTripId = "xyz123";
    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain("/api/enable-disable-trip");
          expect(request.method).toBe("POST");
          reject("Network request failed");
          return;
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.enableDisableTrip(expectedTripId)
      .catch((error) => {
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('errors when calling deleteTrip and network request fails', (done) => {
    let expectedTripId = "xyz123";
    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain("/api/delete-trip");
          expect(request.method).toBe("DELETE");
          reject("Network request failed");
          return;
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.deleteTrip(expectedTripId)
      .catch((error) => {
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  // Setup error cases

  it('errors when calling scheduleTrip without calling setup first', (done) => {
    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let api = new TodAPI(setup);
    let origin = {lat: 99, lng: -23};
    let dest = {lat:45, lng: -90};
    let route = {"name":"bla"};
    let transport = "transit";
    let inputTs = 34232211;
    let inputDateString = "21st March 2011";
    let waitingWindowMs = 5000;
    let repeats = [false, true, true, false, false, false];

    api.scheduleTrip(
      origin, dest, route, transport, inputTs, inputDateString,
      waitingWindowMs, repeats
    )
    .catch((error) => {
      expect(error).toEqual("Call setup() before making API requests")
      done();
    });
  });

  it('errors when calling getScheduledTrips without calling setup first', (done) => {
    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let api = new TodAPI(setup);
    api.getScheduledTrips()
    .catch((error) => {
      expect(error).toEqual("Call setup() before making API requests")
      done();
    });
  });

  it('errors when calling enableDisableTrip without calling setup first', (done) => {
    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let api = new TodAPI(setup);
    api.enableDisableTrip("trip_id1")
    .catch((error) => {
      expect(error).toEqual("Call setup() before making API requests")
      done();
    });
  });

  it('errors when calling deleteTrip without calling setup first', (done) => {
    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let api = new TodAPI(setup);
    api.deleteTrip("trip_id1")
    .catch((error) => {
      expect(error).toEqual("Call setup() before making API requests")
      done();
    });
  });

  // Server error cases
  // TODO: could probably just test _handleResponse instead of every
  // individual call

  it('errors when calling scheduleTrip and server returns error', (done) => {
    let origin = {lat: 99, lng: -23};
    let dest = {lat:45, lng: -90};
    let route = {"name":"bla"};
    let transport = "transit";
    let inputTs = 34232211;
    let inputDateString = "21st March 2011";
    let waitingWindowMs = 5000;
    let repeats = [false, true, true, false, false, false];
    let expectedError = "Something failed on the server...";

    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain("/api/schedule-trip");
          expect(request.method).toBe("POST");
          resolve({status: 500, statusText:expectedError});
          return
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.scheduleTrip(
        origin, dest, route, transport, inputTs, inputDateString,
        waitingWindowMs, repeats
      )
      .catch((error) => {
        expect(error.message).toEqual(expectedError);
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('errors when calling getRoutes and server returns error', (done) => {
    let origin = {lat: 99, lng: -23};
    let dest = {lat:45, lng: -90};
    let routeName = "Example Route 1";
    let transport = "transit";
    let inputTs = 34232211;
    let expectedError = "Something failed on the server...";

    let setup = {};
    let expectedToken = "test_token1";
    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          resolve({status: 500, statusText:expectedError});
          return;
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.getRoutes(origin, dest, transport, inputTs, routeName)
      .catch((error) => {
        expect(error.message).toEqual(expectedError);
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('errors when calling getScheduledTrips and server returns error', (done) => {
    let setup = {};
    let expectedToken = "test_token1";
    let expectedUrl = "/api/get-scheduled-trips?user_id="+expectedToken;
    let expectedError = "Something failed on the server...";

    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain(expectedUrl);
          resolve({status: 500, statusText:expectedError});
          return;
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.getScheduledTrips(expectedToken)
      .catch((error) => {
        expect(error.message).toEqual(expectedError);
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('errors when calling enableDisableTrip and server returns error', (done) => {
    let expectedTripId = "xyz123";
    let setup = {};
    let expectedToken = "test_token1";
    let expectedError = "Something failed on the server...";

    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain("/api/enable-disable-trip");
          expect(request.method).toBe("POST");
          resolve({status: 500, statusText:expectedError});
          return;
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.enableDisableTrip(expectedTripId)
      .catch((error) => {
        expect(error.message).toEqual(expectedError);
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });

  it('errors when calling deleteTrip and server returns error', (done) => {
    let expectedTripId = "xyz123";
    let setup = {};
    let expectedToken = "test_token1";
    let expectedError = "Something failed on the server...";

    let mockSetup = jest.fn().mockImplementation((onToken, onNotification, onError) => {
      onToken(expectedToken);
    });
    let mockFetch = jest.fn().mockImplementation((url, request) => {
      return new Promise(function(resolve, reject) {
        if (mockFetch.mock.calls.length === 2) {
          expect(url).toContain("/api/delete-trip");
          expect(request.method).toBe("DELETE");
          resolve({status: 500, statusText:expectedError});
          return;
        }
        resolve({status: 200});
      });
    });
    global.fetch = mockFetch;
    setup.setupNotifications = mockSetup;
    let api = new TodAPI(setup);
    let onRegister = () => {
      api.deleteTrip(expectedTripId)
      .catch((error) => {
        expect(error.message).toEqual(expectedError);
        done();
      })
    };
    api.setup(onRegister, jest.fn(), jest.fn());
  });
});
