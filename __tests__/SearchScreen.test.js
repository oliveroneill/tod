import React from 'react';
import renderer from 'react-test-renderer';

import SearchScreen from '../src/screens/SearchScreen.js';

it('displays routes correctly', () => {
  let screen = new SearchScreen({navigation:jest.fn()});
  let mockRowData = {
    arrival_time: 1482363467071,
    departure_time: 1482363367071,
    description: "Take x avenue",
    name: "Bus Route 1"
  };
  let component = renderer.create(screen.renderCell(mockRowData, 1));
  expect(component.toJSON()).toMatchSnapshot();
});
