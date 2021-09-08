import React from 'react';

import App from '../../App';
import { SnowplowMediaEvent } from '../../snowplow_events';
import { MediaEvent, TextTrackEvent, DocumentEvent, VideoEvent } from '../../wgEvents';
import { trackMedia } from '@snowplow/browser-plugin-media-tracking'

interface IProps {
  app: App;
}

interface IState {}
export default class HTML5Video extends React.Component<IProps, IState> {
  componentDidMount() {
    trackMedia('html5', {
      percentBoundries: [5, 10, 20],
      mediaLabel: 'Test HTML5 Video Player Label',
      listenEvents: [
        MediaEvent.PAUSE,
        MediaEvent.PLAY,
        MediaEvent.SEEKED,
        MediaEvent.RATECHANGE,
        MediaEvent.VOLUMECHANGE,
        TextTrackEvent.CHANGE,
        SnowplowMediaEvent.PERCENTPROGRESS,
        DocumentEvent.FULLSCREENCHANGE,
        VideoEvent.ENTERPICTUREINPICTURE,
        VideoEvent.LEAVEPICTUREINPICTURE,
      ],
    });
  }

  render() {
    return (
      <div id="video-wrapper">
        <video id="html5" width="100%" src="snowplow-video.mp4" controls>
          <track kind="subtitles" src="text_track.vtt" srcLang="en" label="Example Subs"></track>
        </video>
      </div>
    );
  }
}
