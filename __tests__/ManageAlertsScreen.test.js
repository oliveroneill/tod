import React from 'react';
import renderer from 'react-test-renderer';
import { Switch, TouchableOpacity } from 'react-native';

import { shallow } from 'enzyme';

import ManageAlertsScreen from '../src/screens/ManageAlertsScreen.js';

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
  screen.state.editing = false;
  let component = renderer.create(screen.renderCell(mockRowData, 1));
  expect(component.toJSON()).toMatchSnapshot();
});

it('displays routes correctly while editing', () => {
  let screen = new ManageAlertsScreen({navigation:jest.fn()});
  screen.state.editing = true;
  let component = renderer.create(screen.renderCell(mockRowData, 1));
  expect(component.toJSON()).toMatchSnapshot();
});

it('handles enable', () => {
  let screen = new ManageAlertsScreen({navigation:jest.fn()});
  screen.api = {
    enableDisableTrip: jest.fn().mockImplementation(() => new Promise(function(resolve, reject) {
        resolve();
    }))
  };
  screen.setState = jest.fn();
  const wrapper = shallow(screen.renderCell(mockRowData, 1));
  wrapper.find(Switch).first().props().onValueChange();
  expect(screen.api.enableDisableTrip).toHaveBeenCalledWith(mockRowData.trip_id);
});

it('handles delete', () => {
  let screen = new ManageAlertsScreen({navigation:jest.fn()});
  screen.state.editing = true;
  screen.api = {
    deleteTrip: jest.fn().mockImplementation(() => new Promise(function(resolve, reject) {
        resolve();
    }))
  };
  screen.setState = jest.fn();
  const wrapper = shallow(screen.renderCell(mockRowData, 1));
  wrapper.find(TouchableOpacity).first().props().onPress();
  expect(screen.api.deleteTrip).toHaveBeenCalledWith(mockRowData.trip_id);
});
