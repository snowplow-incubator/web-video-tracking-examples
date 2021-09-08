import React from 'react';

interface IProps {
  el: string;
  tabs: Record<number, { label: string; id: string; tracking: boolean; elem: JSX.Element }>;
  setTab: Function;
}

interface IState {
  videoElem?: HTMLVideoElement | HTMLAudioElement;
  settingsHeight: string;
  showTextTrack: boolean;
}

export default class PlayerSettings extends React.Component<IProps, IState> {
  componentDidMount() {
    this.setState({
      videoElem: document.getElementById(this.props.el) as HTMLVideoElement | HTMLAudioElement,
    });
    this.changeTab = this.changeTab.bind(this);
  }

  changeTab(e: any) {
    this.props.setTab(e.target.value);
  }

  render() {
    return (
      <div id="video-settings">
        <div id="video-settings-header">
          <div className="setting">
            <div className="dropMenu setting">
              <select className="tabSelect" onChange={this.changeTab}>
                {Object.keys(this.props.tabs).map((tab: string) => {
                  let tabIndex: number = parseInt(tab);
                  return (
                    <option key={tab} value={tab}>
                      {this.props.tabs[tabIndex].label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
