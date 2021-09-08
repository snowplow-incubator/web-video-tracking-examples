import { SelfDescribingJson } from '@snowplow/browser-tracker';
import React from 'react';

interface IProps {
  videoData: Record<string, Record<string, { event: string; context: SelfDescribingJson[] }>[]>;
  elementName: string;
  updateParent: Function;
}

interface IState {}

export default class VideoEvents extends React.Component<IProps, IState> {
  setCurrentEventData(index: number) {
    let clickedElementData = this.props.videoData[this.props.elementName][index];
    this.props.updateParent({ videosCurrentEvent: clickedElementData });
  }

  setSelectedEvent(el: HTMLElement) {
    let elemList: Node[] = Array.from(document.getElementById('events')?.children!);
      for (let elem of elemList) {
        let el = elem.firstChild as HTMLElement;
        el.classList.remove('selected');
    }
    el.classList.add('selected');
  }

  render() {
    return (
      <div id="events-wrapper">
        <div id="events">
          {this.props.videoData[this.props.elementName]?.map((x: any, i: number) => {
            return (
              <div key={i} className="event-wrapper">
                <li
                  onMouseDown={(e) => {
                    this.setCurrentEventData(i);
                    this.setSelectedEvent(e.target as HTMLElement);
                  }}
                  className="event"
                >
                  {x.event.data.type}
                  <div className="chevron"></div>
                </li>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
