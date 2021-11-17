import React from 'react';
import 'video.js/dist/video-js.css';

import { enableMediaTracking } from '@snowplow/browser-plugin-media-tracking';
import VideoJsPlayer from './videojs-setup';

interface IProps {}

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
          src: 'test-video.mp4',
        },
      },
    };
  }
  componentDidMount() {
    enableMediaTracking({
      id: 'videojs',
      options: {
        label: 'My fun videoJS label',
        captureEvents: ['AllEvents'],
      },
    });
  }
  render() {
    return (
      <div id="video-wrapper">
        <div id="videojs">
          <VideoJsPlayer {...this.state.videoJsOptions} />
        </div>
      </div>
    );
  }
}
