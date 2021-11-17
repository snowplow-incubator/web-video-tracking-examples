import Plyr from 'plyr';
import React from 'react';

import { enableMediaTracking } from '@snowplow/browser-plugin-media-tracking';
interface IProps {}

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
            src: 'test-video.mp4',
          },
        ],
      },
    };
  }
  componentDidMount() {
    new Plyr('#plyr');
    enableMediaTracking({
      id: 'plyr',
      options: { label: 'Test Plyr Label', captureEvents: ['DefaultEvents'], boundries: [5, 10] },
    });
  }
  render() {
    return (
      <video id="plyr" width="100%" src="test-video.mp4" controls>
        <track kind="subtitles" src="text_track.vtt" srcLang="en" label="Example Subs"></track>
      </video>
    );
  }
}
