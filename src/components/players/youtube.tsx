import React from 'react';

interface IProps {}

interface IState {}

export default class Youtube extends React.Component<IProps, IState> {
  /*
  componentDidMount() {
    enableYoutubeTracking({
      id: 'youtube',
      trackingOptions: {
        mediaLabel: 'Youtube',
      },
    });
  }
  */
  render() {
    return (
      <div id="video-wrapper">
        <iframe
          id="youtube"
          src="https://www.youtube-nocookie.com/embed/_JiBkay7zyk"
          width="100%"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }
}

export {};