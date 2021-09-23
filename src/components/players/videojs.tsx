import { enableMediaTracking } from '../../trackMedia';
import React from 'react';
import 'video.js/dist/video-js.css';

import App from '../../App';
import { AllEvents } from '../../eventGroups';
import VideoJsPlayer from './videojs-setup';

interface IProps {
  app: App;
}

interface IState {
  videoJsOptions: any;
}

export default class VideoJS extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      videoJsOptions: {
        autoplay: false,
        controls: true,
        fluid: true,
        sources: {
          src: 'snowplow-video.mp4',
        },
      },
    };
  }
  componentDidMount() {
    enableMediaTracking('videojs', {
      app: this.props.app,
      mediaLabel: 'My fun videoJS label',
      captureEvents: AllEvents,
    });
  }
  render() {
    return (
      <div id="video-wrapper">
        <VideoJsPlayer id="videojs" {...this.state.videoJsOptions} />
      </div>
    );
  }
}
