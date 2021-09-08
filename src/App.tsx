import { newTracker, SelfDescribingJson } from '@snowplow/browser-tracker';
import React from 'react';
import JSONPretty from 'react-json-pretty';

import './App.css';
import PlayerSettings from './components/PlayerSettings';
import VideoEvents from './components/VideoEvents';
import HTML5Audio from './components/players/html5-audio';
import HTML5Video from './components/players/html5-video';
import Plyr from './components/players/plyr';
import VideoJs from './components/players/videojs';
import { Tab } from './types';
import { MediaTrackingPlugin } from '@snowplow/browser-plugin-media-tracking';

interface IProps {}

interface IState {
  tabs: Record<string, Tab>;
  index: number;
  isConnected: boolean;
  videosCurrentEvent: SelfDescribingJson | Record<string, { emit: string; view: string }>;
  videoData: Record<string, Record<string, { event: string; context: SelfDescribingJson[] }>[]>;
}

function HorizontalDivide() {
  return (
    <div id="line">
      <div id="blocker"></div>
      <div id="arrow"></div>
    </div>
  );
}

function VerticalDivide() {
  return (
    <div id="vertical-divide">
      <div id="vertical-blocker"></div>
      <div id="vertical-arrow"></div>
    </div>
  );
}

export default class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      tabs: {
        0: { label: 'HTML5 Video', id: 'html5', tracking: false, elem: <HTML5Video app={this} /> },
        1: { label: 'Video JS', id: 'videojs', tracking: false, elem: <VideoJs app={this} /> },
        2: { label: 'Plyr', id: 'plyr', tracking: false, elem: <Plyr app={this} /> },
        3: { label: 'HTML5 Audio', id: 'html5-audio', tracking: false, elem: <HTML5Audio app={this} /> },
      },
      index: 0,
      isConnected: false,
      videosCurrentEvent: {
        usage: {
          emit: 'Interact with an audio/video element to emit events',
          view: 'Click on an event to view the produced event JSON',
        },
      },
      videoData: {},
    };
    this.setTab = this.setTab.bind(this);
    this.collectorInfo = this.collectorInfo.bind(this);
    this.getCollectorHealth = this.getCollectorHealth.bind(this);
  }

  componentDidMount() {
    newTracker('sp2', 'http://localhost:8080', {
      appId: 'video-tracker',
      plugins: [MediaTrackingPlugin()],
    });
    this.setTab(0);
    this.getCollectorHealth();
    setInterval(this.getCollectorHealth, 60000);
  }

  collectorInfo() {
    if (this.state.isConnected) {
      return (
        <div id="collector-connection-wrapper">
          <div id="snowplow-collector-label">Snowplow Collector</div>
          <div id="snowplow-connection-status" style={{ color: 'green' }}>
            Connected
          </div>
        </div>
      );
    }
    return (
      <div id="collector-connection-wrapper">
        <div id="snowplow-collector-label">Snowplow Collector</div>
        <div id="snowplow-connection-status" style={{ color: 'red' }}>
          Not Connected
        </div>
      </div>
    );
  }

  async getCollectorHealth() {
    fetch(`http://localhost:2000/iglu-server/api/meta/health`)
      .then(() => {
        this.setState({ isConnected: true });
      })
      .catch(() => {
        this.setState({ isConnected: false });
      });
  }

  setTab(index: number) {
    if (!this.state.tabs[index].tracking) {
      let newState = { ...this.state.tabs };
      newState[index].tracking = true;
      this.setState({ tabs: newState });
    }
    this.setState({ index: index });
  }

  render() {
    return (
      <div id="container">
        <header id="header">
          <img id="logo" alt="logo" src="snowplow-logo.svg"></img>
          <div>SNOWPLOW MEDIA TRACKING</div>
        </header>
        <div id="content-wrapper">
          <this.collectorInfo />
          <div id="left-half" className="half">
            {this.state.tabs[this.state.index].elem}
            <div id="video-settings-wrapper">
              <PlayerSettings
                el={this.state.tabs[this.state.index].id}
                tabs={this.state.tabs}
                setTab={this.setTab}
              ></PlayerSettings>
            </div>
            <HorizontalDivide />
            <div className="title">
              Events
              <div id="top-gradient"></div>
            </div>
            <VideoEvents
              videoData={this.state.videoData}
              elementName={this.state.tabs[this.state.index].id}
              updateParent={(s: IState): void => this.setState(s)}
            ></VideoEvents>
            <div id="bottom-gradient"></div>
          </div>
          <VerticalDivide />
          <div id="right-half" className="half">
            <div id="json">
              <JSONPretty data={JSON.stringify(this.state.videosCurrentEvent)}></JSONPretty>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
