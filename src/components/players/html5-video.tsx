import React from 'react';

import App from '../../App';
import { SnowplowMediaEvent } from '../../snowplow_events';
import { MediaEvent, TextTrackEvent, DocumentEvent, VideoEvent } from '../../wgEvents';
import { enableMediaTracking } from '../../trackMedia';
import { enableMediaTracking as enableMediaTrackingPlugin } from '@snowplow/browser-plugin-media-tracking';

interface IProps {
  app: App;
}

interface IState {}
export default class HTML5Video extends React.Component<IProps, IState> {
  componentDidMount() {
    enableMediaTracking('html5', {
      app: this.props.app,
      percentBoundries: [5, 10, 20],
      mediaLabel: 'Test HTML5 Video Player Label',
      captureEvents: [
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
    enableMediaTrackingPlugin('html5');
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
