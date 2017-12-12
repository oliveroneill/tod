import React from 'react';
import {
  Text
} from 'react-native';
import renderer from 'react-test-renderer';

import APIComponent from '../../src/components/APIComponent.js';
import TodAPI from '../../src/utils/TodAPI.js';

function mockTodAPI() {
  // Mock out the interface to TodAPI
  // So that we can avoid warning with PropTypes
  TodAPI.prototype.setup = jest.fn();
  TodAPI.prototype.sendToken = jest.fn();
  TodAPI.prototype.scheduleTrip = jest.fn();
  TodAPI.prototype.getScheduledTrips = jest.fn();
  TodAPI.prototype.getRoutes = jest.fn();
  TodAPI.prototype.enableDisableTrip = jest.fn();
  TodAPI.prototype.deleteTrip = jest.fn();
}

function setup() {
  navigator.geolocation.getCurrentPosition = jest.fn();
  mockTodAPI();
  let api = new TodAPI();
  return api;
}

describe('APIComponent', () => {
  beforeEach(() => {
    navigator = {
      geolocation: {
        getCurrentPosition: jest.fn()
      }
    };
  })

  it('shows spinner while loading', () => {
    let api = setup();
    let component = renderer.create(
      <APIComponent
        api={api}
        onLocation={jest.fn()}
        onNotification={jest.fn()}
      />
    );
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('checks location after logging in', () => {
    let api = setup();
    api.setup = jest.fn().mockImplementation((onRegister, onNotification, onError) => {
      onRegister();
    });
    let component = renderer.create(
      <APIComponent
        api={api}
        onLocation={jest.fn()}
        onNotification={jest.fn()}
      />
    );
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('shows children when location and logging in complete', () => {
    let api = new TodAPI();
    api.setup = jest.fn().mockImplementation((onRegister, onNotification, onError) => {
      onRegister();
    });
    let onComplete = jest.fn();
    let mockLocFunction = jest.fn().mockImplementation((onLocation, onError) => {
      onLocation({coords: {latitude: 1, longitude: 1}});
    });
    navigator.geolocation.getCurrentPosition = mockLocFunction;
    let component = renderer.create(
      <APIComponent
        api={api}
        onLocation={onComplete}
        onNotification={jest.fn()}
      />
    );
    expect(mockLocFunction).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('shows error case on send token failure', () => {
    let api = setup();
    api.setup = jest.fn().mockImplementation((onRegister, onNotification, onError) => {
      onError();
    });
    let component = renderer.create(
      <APIComponent
        api={api}
        onLocation={jest.fn()}
        onNotification={jest.fn()}
      />
    );
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('shows error case when location is disabled', () => {
    let api = new TodAPI();
    api.setup = jest.fn().mockImplementation((onRegister, onNotification, onError) => {
      onRegister();
    });
    let onComplete = jest.fn();
    let mockLocFunction = jest.fn().mockImplementation((onLocation, onError) => {
      onError();
    });
    navigator.geolocation.getCurrentPosition = mockLocFunction;
    let component = renderer.create(
      <APIComponent
        api={api}
        onLocation={onComplete}
        onNotification={jest.fn()}
      />
    );
    expect(mockLocFunction).toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });
});