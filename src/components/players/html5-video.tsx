import React from 'react';

import { enableMediaTracking } from '@snowplow/browser-plugin-media-tracking';

interface IProps {
}

interface IState {}
export default class HTML5Video extends React.Component<IProps, IState> {
  componentDidMount() {
    enableMediaTracking({
      id: 'html5',
      options: {
        boundries: [5, 10, 20],
        label: 'Test HTML5 Video Player Label',
        captureEvents: [
         'pause',
         'play',
         'seeked',
         'ratechange',
         'volumechange',
         'change',
         'percentprogress',
         'fullscreenchange',
         'enterpictureinpicture',
         'leavepictureinpicture',
        ],
      },
    });
  }

  render() {
    return (
        <video id="html5" src="test-video.mp4" controls>
          <track kind="subtitles" src="text_track.vtt" srcLang="en" label="Example Subs"></track>
        </video>
    );
  }
}
