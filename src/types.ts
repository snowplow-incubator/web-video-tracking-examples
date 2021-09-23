import { MediaElement, MediaPlayerEvent, VideoElement } from './contexts';
import { SnowplowMediaEvent } from './snowplowEvents';
import { MediaEvent, TextTrackEvent, DocumentEvent, VideoEvent } from './mediaEvents';

export interface Tab { label: string; id: string; tracking: boolean; elem: JSX.Element };

export type EventGroup = (DocumentEvent | MediaEvent | SnowplowMediaEvent | TextTrackEvent | VideoEvent)[];

export type MediaEventType = DocumentEvent | MediaEvent | SnowplowMediaEvent | TextTrackEvent | VideoEvent;

export type HTMLMediaElement = HTMLAudioElement | HTMLVideoElement;

export interface MediaOptions {
  mediaId?: string;
  percentBoundries?: number[];
  captureEvents?: EventGroup;
  mediaLabel?: string;
  percentTimeoutIds?: any[];
  volumeChangeTimeout?: any;
  app: any;
}

export interface MediaConf {
  mediaId: string;
  percentBoundries: number[];
  captureEvents: EventGroup;
  mediaLabel?: string;
  percentTimeoutIds: any[];
  volumeChangeTimeout?: any;
  app: any;
}

export interface SnowplowData {
  percent?: number;
  file_extension: string;
  fullscreen: boolean;
  [key: string]: boolean | number | string | undefined;
}

export interface MediaEventData {
  schema: string;
  data: MediaPlayerEvent;
  context: MediaEntities[];
}

export interface MediaEntities {
  schema: string;
  data: MediaElement | VideoElement | SnowplowData;
}

export interface TextTrackObject {
  label: string;
  language: string;
  kind: string;
  mode: string;
}