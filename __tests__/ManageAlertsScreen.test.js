import React from 'react';
import renderer from 'react-test-renderer';
import { Switch, TouchableOpacity, ListView } from 'react-native';

import { shallow } from 'enzyme';

import LoadingScreen from '../src/components/LoadingScreen.js';
import ManageAlertsScreen from '../src/screens/ManageAlertsScreen.js';

function createMockProps(getScheduledTrips) {
  return {
      navigation: {
        setParams: jest.fn(),
        state: {
          params: {
            api: {
              getScheduledTrips: getScheduledTrips
            }
          }
        }
      }
    };
}

describe('ManageAlertsScreen', () => {
  let mockRowData = {
    route: {
      arrival_time: 1482363467071,
      departure_time: 1482363367071,
      description: "Take x avenue",
      name: "Bus Route 1"
    },
    repeat_days: [false, true, true, false, false, false, true],
    transport_type:"walking",
    enabled: true,
    trip_id:"4543",
  };

  it('displays routes correctly', () => {
    let screen = new ManageAlertsScreen({navigation:jest.fn()});
    // snapshot test while editing is false
    screen.state.editing = false;
    let component = renderer.create(screen.renderCell(mockRowData, 1));
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('displays routes correctly while editing', () => {
    let screen = new ManageAlertsScreen({navigation:jest.fn()});
    // snapshot test while editing is true
    screen.state.editing = true;
    let component = renderer.create(screen.renderCell(mockRowData, 1));
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('handles disable', () => {
    // given
    let screen = new ManageAlertsScreen({navigation:jest.fn()});
    screen.api = {
      enableDisableTrip: jest.fn().mockReturnValue(Promise.resolve())
    };
    screen.setState = jest.fn();
    let wrapper = shallow(screen.renderCell(mockRowData, 1));
    // when
    // change the switch value
    wrapper.find(Switch).first().props().onValueChange();
    // then
    // ensure that the trip was disabled
    expect(screen.api.enableDisableTrip).toHaveBeenCalledWith(mockRowData.trip_id);
  });

  it('handles enable', () => {
    // given
    let screen = new ManageAlertsScreen({navigation:jest.fn()});
    screen.api = {
      enableDisableTrip: jest.fn().mockReturnValue(Promise.resolve())
    };
    screen.setState = jest.fn();
    let wrapper = shallow(screen.renderCell(mockRowData, 1));
    // when
    // disable trip
    wrapper.find(Switch).first().props().onValueChange();
    // ensure the api was called
    expect(screen.api.enableDisableTrip).toHaveBeenCalledWith(mockRowData.trip_id);
    // enable trip
    wrapper.find(Switch).first().props().onValueChange();
    // then
    // ensure it was called again
    expect(screen.api.enableDisableTrip).toHaveBeenCalledWith(mockRowData.trip_id);
  });

  it('handles delete', () => {
    // given
    let screen = new ManageAlertsScreen({navigation:jest.fn()});
    screen.state.editing = true;
    screen.api = {
      deleteTrip: jest.fn().mockReturnValue(Promise.resolve())
    };
    screen.setState = jest.fn();
    let wrapper = shallow(screen.renderCell(mockRowData, 1));
    // when
    // press delete button
    wrapper.find(TouchableOpacity).first().props().onPress();
    // then
    // ensure trip is deleted
    expect(screen.api.deleteTrip).toHaveBeenCalledWith(mockRowData.trip_id);
  });

  it('shows loading screen while searching', () => {
    let mockGetScheduledTrips = jest.fn().mockReturnValue(
      new Promise(function(resolve, reject) {})
    );
    let props = createMockProps(mockGetScheduledTrips);
    let enzymeWrapper = shallow(<ManageAlertsScreen {...props} />);
    let loading = enzymeWrapper.find(LoadingScreen);
    // ensure that it starts loading as soon as its rendered
    expect(loading.exists()).toBe(true);
    // ensure it contacted the api
    expect(mockGetScheduledTrips).toHaveBeenCalled();
  });

  it('shows list of trips once loaded', () => {
    let promise = Promise.resolve([]);
    let mockGetScheduledTrips = jest.fn().mockReturnValue(promise);
    let props = createMockProps(mockGetScheduledTrips);
    let enzymeWrapper = shallow(<ManageAlertsScreen {...props} />);
    // wait for api to successfully retrieve scheduled trips
    return promise.then(() => {
      enzymeWrapper.update();
      // ensure that list view is now visible
      let list = enzymeWrapper.find(ListView);
      expect(list.exists()).toBe(true);
      // ensure that the api was contacted
      expect(mockGetScheduledTrips).toHaveBeenCalled();
    });
  });

  it('shows error message when api call fails', () => {
    let promise = Promise.reject();
    let mockGetScheduledTrips = jest.fn().mockReturnValue(promise);
    let props = createMockProps(mockGetScheduledTrips);
    let enzymeWrapper = shallow(<ManageAlertsScreen {...props} />);
    // wait for api to successfully retrieve scheduled trips
    return promise
    .catch(() => {
      enzymeWrapper.update();
    })
    .then(() => {
      enzymeWrapper.update();
      // ensure that list view is still not visible
      expect(enzymeWrapper.find(ListView).exists()).toBe(false);
      // ensure the loading screen is stil visible
      let loading = enzymeWrapper.find(LoadingScreen);
      expect(loading.exists()).toBe(true);
      // ensure its in the error state
      expect(loading.props().errored).toBe(true);
      // ensure that the api was contacted
      expect(mockGetScheduledTrips).toHaveBeenCalled();
    });
  });
});
