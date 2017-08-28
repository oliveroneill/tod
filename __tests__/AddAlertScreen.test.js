import React from 'react';
import renderer from 'react-test-renderer';

import AddAlertScreen from '../src/screens/AddAlertScreen.js';

describe('AddAlertScreen', () => {
  let mockRowData = {
    route: {
      arrival_time: 1482363467071,
      departure_time: 1482363367071,
      description: "Take x avenue",
      name: "Bus Route 1"
    },
    subtitle: "Take x avenue",
    repeat_days: [false, true, true, false, false, false, true],
    transport_type:"walking",
    enabled: true,
    trip_id:"4543",
  };

  it('displays route correctly', () => {
    let component = renderer.create(
      <AddAlertScreen
        navigation={{state: {params: mockRowData}, setParams:function(){}}}
      />
    );
    expect(component.toJSON()).toMatchSnapshot()
  });
});