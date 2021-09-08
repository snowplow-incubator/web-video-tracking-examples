import { SelfDescribingJson, trackSelfDescribingEvent } from '@snowplow/browser-tracker';

import App from './App';
import { ready_state_consts, network_state_consts } from './consts';
import { ControlEvents } from './eventGroups';
import {
  timeRangesToObjectArray,
  textTrackListToJson,
  isTypeTextTrackEvent,
  checkPercentBoundryArrayIsValid,
  isTypeDocumentEvent,
  isElementFullScreen,
} from './helperFunctions';
import { SnowplowMediaEvent } from './snowplow_events';
import { DocumentEvent, MediaEvent } from './wgEvents';
import { MediaProperty, VideoProperty } from './wgProperties';
import { MediaTrackingConfig, SnowplowData, MediaEventType, HTMLMediaElement } from './types';

declare global {
  interface HTMLVideoElement {
    controlsList: IterableIterator<any>;
    disablePictureInPicture: boolean;
    autoPictureInPicture?: boolean;
    disableRemotePlayback?: boolean;
  }

  interface HTMLAudioElement {
    disableRemotePlayback: any;
  }
}

export default function trackMedia(mediaId: string, app: App, config: MediaTrackingConfig = {}): void {
  // --- Setup ---
  const listenEvents = config.listenEvents || ControlEvents;
  const percentBoundries = config.percentBoundries || [10, 25, 50, 75];
  const mediaLabel = config.mediaLabel || 'custom_media_label';
  const percentTimeoutIds: any[] = [];

  checkPercentBoundryArrayIsValid(percentBoundries);

  const eventsWithOtherFunctions: Record<string, Function> = {
    [DocumentEvent.FULLSCREENCHANGE]: (el: HTMLMediaElement) => fullScreenEventHandler(el),
  };

  // Assigns each event in 'listenEvents' a callback
  const eventHandlers: Record<string, Function> = {};
  for (let ev of Object.values(listenEvents)) {
    if (eventsWithOtherFunctions.hasOwnProperty(ev)) {
      eventHandlers[ev] = (el: HTMLMediaElement) => eventsWithOtherFunctions[ev](el);
    }
    eventHandlers[ev] = (el: HTMLMediaElement, e: MediaEventType) => mediaPlayerEvent(el, e);
  }

  findMediaElem();

  // --- Functions ---

  function setPercentageBoundTimeouts(el: HTMLMediaElement) {
    for (let p of percentBoundries) {
      let percentTime = el[MediaProperty.DURATION] * 1000 * (p / 100);
      if (el[MediaProperty.CURRENTTIME] !== 0) {
        percentTime -= el[MediaProperty.CURRENTTIME] * 1000;
      }
      if (p < percentTime) {
        percentTimeoutIds.push(setTimeout(() => waitAnyRemainingTimeAfterTimeout(el, percentTime, p), percentTime));
      }
    }
  }

  // Setting the timeout callback above as mediaPlayerEvent will result in a discrepency between the setTimeout time and
  // the current video time when the event fires of ~100 - 300ms

  // The below function waits any required amount of remaining time, to ensure the event is fired as close as possible to the
  // appropriate percentage boundry time.

  function waitAnyRemainingTimeAfterTimeout(el: HTMLMediaElement, percentTime: number, p: number) {
    if (el[MediaProperty.CURRENTTIME] * 1000 < percentTime) {
      setTimeout(() => waitAnyRemainingTimeAfterTimeout(el, percentTime, p), 10);
    } else {
      mediaPlayerEvent(el, SnowplowMediaEvent.PERCENTPROGRESS, { percentThrough: p });
    }
  }

  function mediaPlayerEvent(el: HTMLMediaElement, e: MediaEventType, eventDetail?: any): void {
    if (listenEvents.includes(SnowplowMediaEvent.PERCENTPROGRESS)) {
      if (e === MediaEvent.PAUSE) {
        while (percentTimeoutIds.length) {
          clearTimeout(percentTimeoutIds.pop());
        }
      }

      if (e === MediaEvent.PLAY && el[MediaProperty.READYSTATE] > 0) {
        setPercentageBoundTimeouts(el);
        el.defaultPlaybackRate = 0;
      }
    }

    let playerEvent: SelfDescribingJson<Record<string, unknown>> = {
      schema: 'iglu:com.snowplowanalytics/media_player_event/jsonschema/1-0-0',
      data: {
        type: e,
        player_id: mediaId,
        media_type: el.tagName,
        media_label: mediaLabel,
      },
    }

    let mediaContext: SelfDescribingJson<Record<string, unknown>>[] = [
      {
        schema: 'iglu:org.whatwg/media_element/jsonschema/1-0-0',
        data: {
          auto_play: el[MediaProperty.AUTOPLAY],
          buffered: timeRangesToObjectArray(el[MediaProperty.BUFFERED]),
          controls: el[MediaProperty.CONTROLS],
          cross_origin: el[MediaProperty.CROSSORIGIN],
          current_source: el[MediaProperty.CURRENTSRC],
          current_time: el[MediaProperty.CURRENTTIME],
          default_muted: el[MediaProperty.DEFAULTMUTED],
          default_playback_rate: el[MediaProperty.DEFAULTPLAYBACKRATE],
          disable_remote_playback: el[MediaProperty.DISABLEREMOTEPLAYBACK],
          duration: el[MediaProperty.DURATION],
          ended: el[MediaProperty.ENDED],
          error: el[MediaProperty.ERROR],
          loop: el[MediaProperty.LOOP],
          muted: el[MediaProperty.MUTED],
          network_state: network_state_consts[el[MediaProperty.NETWORKSTATE]],
          paused: el[MediaProperty.PAUSED],
          playback_rate: el[MediaProperty.PLAYBACKRATE],
          preload: el[MediaProperty.PRELOAD],
          ready_state: ready_state_consts[el[MediaProperty.READYSTATE]],
          seekable: timeRangesToObjectArray(el[MediaProperty.SEEKABLE]),
          seeking: el[MediaProperty.SEEKING],
          src: el[MediaProperty.SRC],
          src_object: el[MediaProperty.SRCOBJECT],
          text_tracks: textTrackListToJson(el[MediaProperty.TEXTTRACKS]),
          volume: el[MediaProperty.VOLUME],
        },
      },
    ];

    const snowplowData: SnowplowData = {
      file_extension: el[MediaProperty.CURRENTSRC].split('.').pop() || 'unknown',
      fullscreen: isElementFullScreen(mediaId),
      picture_in_picture: document.pictureInPictureElement?.id === mediaId,
    };

    if (e === SnowplowMediaEvent.PERCENTPROGRESS) {
      snowplowData.percent = eventDetail.percentThrough!;
    }

    mediaContext.push({
      schema: 'iglu:com.snowplowanalytics/media_context/jsonschema/1-0-0',
      data: {
        ...snowplowData,
      },
    });

    if (el instanceof HTMLVideoElement) {
      mediaContext.push({
        schema: 'iglu:org.whatwg/video_element/jsonschema/1-0-0',
        data: {
          autopictureinpicture: el[VideoProperty.AUTOPICTUREINPICTURE],
          disable_picture_in_picture: el[VideoProperty.DISABLEPICTUREINPICTURE],
          poster: el[VideoProperty.POSTER],
          video_height: el[VideoProperty.VIDEOHEIGHT],
          video_width: el[VideoProperty.VIDEOWIDTH],
        },
      });
    }

    // A deep copy is needed here, as the event JSON shown on the right pane would otherwise be a reference to the
    // element, meaning the top most event could be changed by manipulating the properties of the media element
    let deepCopy = {
      event: JSON.parse(JSON.stringify(playerEvent)),
      context: JSON.parse(JSON.stringify(mediaContext)),
    };
    let newState = { ...app.state.videoData };
    if (app.state.videoData.hasOwnProperty(mediaId)) {
      newState[mediaId].push(deepCopy);
    } else {
      newState[mediaId] = [deepCopy];
    }
    app.setState({ videoData: newState });

    trackSelfDescribingEvent({
      event: playerEvent,
      context: mediaContext,
    });
  }

  function getPlayerType(el: HTMLMediaElement): string {
    let player_type = '';
    // The main class names VideoJS and Plyr give their elements
    let player_class_names = ['video-js', 'plyr'];
    for (let name of player_class_names) {
      let elems = el.getElementsByClassName(name);
      if (elems.length) {
        player_type = name;
      }
    }
    return player_type;
  }

  function getPlyrPlayer(el: HTMLMediaElement, retryCount: number, retryLimit: number): void {
    // Find the video elem within the Plyr instance
    let videoEl = el.getElementsByTagName('VIDEO')[0] as HTMLVideoElement;
    // Plyr loads in an initial blank video with currentSrc as https://cdn.plyr.io/static/blank.mp4
    // so we need to check until currentSrc updates (there's probably a better way of doing this)
    if (videoEl.currentSrc === 'https://cdn.plyr.io/static/blank.mp4' || videoEl.currentSrc === '') {
      if (retryCount === retryLimit) {
        console.error("Plyr hasn't loaded your video yet.");
        return;
      }
      setTimeout(() => getPlyrPlayer(el, retryCount + 1, retryLimit), 10 ** retryCount);
    } else {
      addEventListeners(videoEl);
    }
  }

  function findMediaElem(): void {
    let mediaTags = ['AUDIO', 'VIDEO'];
    let el: HTMLMediaElement = document.getElementById(mediaId) as HTMLMediaElement;
    let playerType = getPlayerType(el);
    if (!el) {
      console.error(`Couldn't find passed element id: ${mediaId}.\nEnsure you have entered the correct element id.`);
      return;
    } else {
      if (playerType === 'plyr') {
        getPlyrPlayer(el, 1, 5);
        return;
      }
      let searchEl: HTMLMediaElement = el;
      if (!mediaTags.includes(el.tagName)) {
        searchEl = el.getElementsByTagName('VIDEO')[0] as HTMLVideoElement;
        if (!searchEl) {
          searchEl = el.getElementsByTagName('AUDIO')[0] as HTMLAudioElement;
          if (!searchEl) {
            console.error(`Couldn't find a Video or Audio element with the passed HTML id: ${mediaId}`);
            return;
          }
        }
      }
      if (searchEl) addEventListeners(searchEl);
    }
  }

  function addEventListeners(el: HTMLMediaElement): void {
    for (let e of listenEvents) {
      let ev: EventListener = () => eventHandlers[e](el, e);
      try {
        if (isTypeTextTrackEvent(e)) {
          el.textTracks.addEventListener(e, ev);
        } else if (isTypeDocumentEvent(e)) {
          document.addEventListener(e, ev);
          // Chrome and Safari both use the 'webkit' prefix for the 'fullscreenchange' event
          if (e === DocumentEvent.FULLSCREENCHANGE) {
            document.addEventListener('webkit' + e, ev);
            document.addEventListener('MS' + e, ev);
          }
        } else {
          el.addEventListener(e, ev);
        }
      } catch (e) {
        // IE
      }
    }
  }

  // ------ Event Handlers ------
  function fullScreenEventHandler(el: HTMLMediaElement) {
    if (document.fullscreenElement?.id === mediaId) {
      mediaPlayerEvent(el, DocumentEvent.FULLSCREENCHANGE);
    }
  }
}
