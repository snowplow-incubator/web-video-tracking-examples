import { SnowplowMediaEvent } from './snowplow_events';
import { MediaEvent, TextTrackEvent, DocumentEvent, VideoEvent } from './wgEvents';

export interface Tab { label: string; id: string; tracking: boolean; elem: JSX.Element };

export type EventGroup = (DocumentEvent | MediaEvent | SnowplowMediaEvent | TextTrackEvent | VideoEvent)[];

export type MediaEventType = DocumentEvent | MediaEvent | SnowplowMediaEvent | TextTrackEvent | VideoEvent;

export type HTMLMediaElement = HTMLAudioElement | HTMLVideoElement;

export interface MediaTrackingConfig {
  percentBoundries?: number[];
  listenEvents?: EventGroup;
  mediaLabel?: string;
}

export interface SnowplowData {
  percent?: number;
  file_extension: string;
  fullscreen: boolean;
  [key: string]: boolean | number | string | undefined;
}
