import React from 'react';

import { enableMediaTracking } from '@snowplow/browser-plugin-media-tracking';
interface IProps {
}

interface IState {
  tracking: any;
}
export default class HTML5Audio extends React.Component<IProps, IState> {
  componentDidMount() {
    this.setState({
      tracking: enableMediaTracking({ id: 'html5-audio', options: { label: 'HTML5Audio', captureEvents: ['AllEvents'] } }),
    });
  }

  render() {
    return (
      <div id="video-wrapper">
        <audio id="html5-audio" src="test-audio.m4a" controls></audio>
      </div>
    );
  }
}
