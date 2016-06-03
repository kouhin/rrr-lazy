import React, { Component } from 'react';
import { Lazy } from 'rrr-lazy';

import './style.css';

class Application extends Component {
  render() {
    return (
      <div>
        <div className="filler" />
        <Lazy offsetVertical={300} style={{ height: 762 }}>
          <img role="presentation" src="http://apod.nasa.gov/apod/image/1502/HDR_MVMQ20Feb2015ouellet1024.jpg" />
        </Lazy>
        <div className="filler" />
        <Lazy offsetVertical={300} style={{ height: 683 }}>
          <img role="presentation" src="http://apod.nasa.gov/apod/image/1502/2015_02_20_conj_bourque1024.jpg" />
        </Lazy>
        <div className="filler" />
        <div className="ScrollableContainer">
          <div className="filler" />
          <div className="filler" />
          <div className="filler" />
          <Lazy style={{ height: 480 }}>
            <img role="presentation" src="http://apod.nasa.gov/apod/image/1502/MarsPlume_jaeschke_480.gif" />
          </Lazy>
        </div>
        <div className="filler" />
        <Lazy offsetVertical={300} style={{ height: 720 }}>
          <img role="presentation" src="http://apod.nasa.gov/apod/image/1502/ToadSky_Lane_1080_annotated.jpg" />
        </Lazy>
        <div className="filler" />
      </div>
    );
  }
}

export default Application;
