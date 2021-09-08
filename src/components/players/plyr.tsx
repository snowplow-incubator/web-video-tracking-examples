import Plyr from 'plyr';
import React from 'react';

import App from '../../App';
import { ControlEvents } from '../../eventGroups';
import { trackMedia } from '@snowplow/browser-plugin-media-tracking'

interface IProps {
  app: App;
}

interface IState {
  plyrSource: any;
}

export default class PlyrVideo extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      plyrSource: {
        type: 'video',
        tracks: 'text_track.vtt',
        sources: [
          {
            src: 'snowplow-video.mp4',
          },
        ],
      },
    };
  }
  componentDidMount() {
    new Plyr('#plyr');
    trackMedia('plyr', { mediaLabel: 'Test Plyr Label', listenEvents: ControlEvents});
  }
  render() {
    return (
      <div id="video-container">
        <video id="plyr" width="100%" src="snowplow-video.mp4" controls>
          <track kind="subtitles" src="text_track.vtt" srcLang="en" label="Example Subs"></track>
        </video>
      </div>
    );
  }
}
