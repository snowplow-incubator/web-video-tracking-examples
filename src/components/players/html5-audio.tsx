import React from 'react';

import App from '../../App';
import { trackMedia } from '@snowplow/browser-plugin-media-tracking'

interface IProps {
  app: App;
}

interface IState {
  tracking: any;
}
export default class HTML5Audio extends React.Component<IProps, IState> {
  componentDidMount() {
    this.setState({
      tracking: trackMedia('html5-audio', { mediaLabel: 'HTML5Audio' }),
    });
  }

  render() {
    return (
      <div id="video-wrapper">
        <audio id="html5-audio" src="snowplow.mp3" controls></audio>
      </div>
    );
  }
}
