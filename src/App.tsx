import { newTracker } from '@snowplow/browser-tracker';
import React from 'react';

import './App.css';
import HTML5Audio from './components/players/html5-audio';
import HTML5Video from './components/players/html5-video';
import Plyr from './components/players/plyr';
import VideoJs from './components/players/videojs';
import { MediaTrackingPlugin } from '@snowplow/browser-plugin-media-tracking';
import Youtube from './components/players/youtube';

interface IProps {}

interface IState {
  tabs: Record<string, any>;
  index: number;
}

export default class App extends React.Component<IProps, IState> {
  componentDidMount() {
    newTracker('sp2', 'http://localhost:8080', {
      appId: 'video-tracker',
      plugins: [MediaTrackingPlugin()],
    });
  }

  render() {
    return (
      <div id="container">
        <header id="header">
          <img id="logo" alt="logo" src="snowplow-logo.svg"></img>
          <div>SNOWPLOW MEDIA TRACKING</div>
        </header>
        <div id="videos">
          <div className="video-container">
            <span>HTML5</span>
            <HTML5Video />
          </div>
          <div className="video-container">
            <span>VideoJS</span>
            <VideoJs />
          </div>
          <div className="video-container">
            <span>Plyr</span>
            <Plyr />
          </div>
          <div className="video-container">
            <span>YouTube</span>
            <Youtube />
          </div>
          <div className="video-container">
            <span>HTML5 Audio</span>
            <HTML5Audio />
          </div>
        </div>
      </div>
    );
  }
}
