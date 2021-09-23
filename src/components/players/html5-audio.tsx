import React from 'react';

import App from '../../App';
import { enableMediaTracking } from '../../trackMedia';
interface IProps {
  app: App;
}

interface IState {
  tracking: any;
}
export default class HTML5Audio extends React.Component<IProps, IState> {
  componentDidMount() {
    this.setState({
      tracking: enableMediaTracking('html5-audio', { app: this.props.app, mediaLabel: 'HTML5Audio' }),
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
