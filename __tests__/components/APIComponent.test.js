import React from 'react';
import {
  Text
} from 'react-native';
import renderer from 'react-test-renderer';

import APIComponent from '../../src/components/APIComponent.js';
import TtgApi from '../../src/utils/TtgApi.js';

describe('APIComponent', () => {
  beforeEach(() => {
    navigator = {
      geolocation: {
        getCurrentPosition: jest.fn()
      }
    };
  })
  it('shows spinner while loading', () => {
    let api = {};
    api.setup = jest.fn();
    let mockLocFunction = jest.fn()
    navigator.geolocation.getCurrentPosition = mockLocFunction;
    let component = renderer.create(
      <APIComponent
        api={api}
        onComplete={jest.fn()}
        onNotification={jest.fn()}
      >
        <Text>Example child component</Text>
      </APIComponent>
    );
    expect(mockLocFunction).not.toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('checks location after logging in', () => {
    let api = {};
    api.setup = jest.fn().mockImplementation((onRegister, onNotification, onError) => {
      onRegister();
    });
    let mockLocFunction = jest.fn();
    navigator.geolocation.getCurrentPosition = mockLocFunction;
    let component = renderer.create(
      <APIComponent
        api={api}
        onComplete={jest.fn()}
        onNotification={jest.fn()}
      >
        <Text>Example child component</Text>
      </APIComponent>
    );
    expect(mockLocFunction).toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('shows children when location and logging in complete', () => {
    let api = {};
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
        onComplete={onComplete}
        onNotification={jest.fn()}
      >
        <Text>Example child component</Text>
      </APIComponent>
    );
    expect(mockLocFunction).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('shows error case on send token failure', () => {
    let api = {};
    api.setup = jest.fn().mockImplementation((onRegister, onNotification, onError) => {
      onError();
    });
    let mockLocFunction = jest.fn();
    navigator.geolocation.getCurrentPosition = mockLocFunction;
    let component = renderer.create(
      <APIComponent
        api={api}
        onComplete={jest.fn()}
        onNotification={jest.fn()}
      >
        <Text>Example child component</Text>
      </APIComponent>
    );
    expect(mockLocFunction).not.toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('shows error case when location is disabled', () => {
    let api = {};
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
        onComplete={onComplete}
        onNotification={jest.fn()}
      >
        <Text>Example child component</Text>
      </APIComponent>
    );
    expect(mockLocFunction).toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });
});