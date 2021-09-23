import { trackSelfDescribingEvent } from '@snowplow/browser-tracker';
import { MediaPlayerEvent } from './contexts';
import { getAllUrlParams } from './helperFunctions';
import { MediaEventData } from './types';
import { YTEntityFunction, YTError, YTEvent, YTQueryStringParameter, YTState, YTStateName } from './youtubeEntities';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: any;
    YT: any;
  }
}

export function youtube(el: HTMLIFrameElement): any | null {
  let player: YT.Player;
  let queryStringParams: { [index: string]: string[] | string | number } = getAllUrlParams(el.src!);
  let currentTime: number = 0;
  let scrubInterval: any;

  if (!queryStringParams.hasOwnProperty('enablejsapi')) {
    queryStringParams['enablejsapi'] = 1;
  }
  let url: string = el.src?.split('?')[0];
  if (url && url.length > 1) {
    el.src +=
      '?' +
      Object.keys(queryStringParams)
        .map((k) => `${k}=${queryStringParams[k]}`)
        .join('&');
  }

  const tag: HTMLScriptElement = document.createElement('script');
  tag.id = 'test';
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = () => {
    let funcData: any = {
      id: el.id,
      params: queryStringParams,
      currentTime: currentTime,
      scrubInterval: scrubInterval,
    };
    player = new YT.Player(el.id!, {
      events: {
        onReady: (e: YT.PlayerEvent) => {
          youtubeEvent(player, { e: e, eventName: YTEvent.ONPLAYERREADY, ...funcData });
        },
        onStateChange: (e: YT.OnStateChangeEvent) => {
          youtubeEvent(player, { e: e, eventName: YTState[e.data], ...funcData });
        },
        onPlaybackQualityChange: (e: YT.OnPlaybackQualityChangeEvent) => {
          youtubeEvent(player, { e: e, eventName: YTEvent.ONPLAYBACKQUALITYCHANGE, ...funcData });
        },
        onApiChange: (e: YT.PlayerEvent) => {
          youtubeEvent(player, { e: e, eventName: YTEvent.ONAPICHANGE, ...funcData });
        },
        onError: (e: YT.OnErrorEvent) => {
          youtubeEvent(player, { e: e, eventName: YTEvent.ONERROR, ...funcData });
        },
        onPlaybackRateChange: (e: YT.OnPlaybackRateChangeEvent) =>
          youtubeEvent(player, { e: e, eventName: YTEvent.ONPLAYBACKRATECHANGE, ...funcData }),
      },
    });
  };
}

interface YTEventData {
  e:
    | YT.PlayerEvent
    | YT.OnStateChangeEvent
    | YT.OnPlaybackQualityChangeEvent
    | YT.OnErrorEvent
    | YT.OnPlaybackRateChangeEvent;
  id: string;
  params: any;
  eventName: YTEvent;
  customData?: any;
  activeState?: typeof YTState;
  [index: string]: any;
}

function seekEventTracker(player: YT.Player, currentTime: number) {
  if (player.getCurrentTime() !== currentTime + 1) {
    console.log('scrub');
  }
}

function youtubeEvent(player: YT.Player, eventData: YTEventData) {
  console.log(eventData.eventName);
  let eventActions: { [index: string]: any } = {
    [YTEvent.ONERROR]: { error: YTError[(eventData.e as YT.OnErrorEvent).data] },
    [YTState.PLAYING]: () => {
      eventData.scrubInterval = setInterval(() => {
        seekEventTracker(player, eventData.currentTime);
        console.log('interval');
      }, 1000);
    },
  };
  if (eventActions.hasOwnProperty(eventData.eventName)) {
    eventData.customData = eventActions[eventData.eventName];
  }
  let mediaEventData: MediaPlayerEvent = {
    type: eventData.eventName,
    player_id: eventData.htmlId,
    media_type: 'VIDEO',
  };
  let mediaContext = [getYoutubePlayerEntities(player, eventData)];
  trackYoutubeEvent({
    schema: 'iglu:com.snowplowanalytics/media_player_event/jsonschema/1-0-0',
    data: mediaEventData,
    context: mediaContext,
  });
}

function trackYoutubeEvent(event: MediaEventData): void {
  trackSelfDescribingEvent({
    event: event,
    context: event.context,
  });
}

const queryParamPresentAndEnabled = (param: string, params: any) => {
  if (params.hasOwnProperty(param)) {
    return params[param] === 1;
  }
  return false;
};

function getYoutubePlayerEntities(player: YT.Player, eventData: any): any {
  let playerState: { [index: string]: boolean } = {};
  for (let s of Object.keys(YTState)) {
    if (YTStateName.hasOwnProperty(s)) playerState[YTStateName[s]] = false;
  }
  playerState[YTStateName[player.getPlayerState()]] = true;

  let spherical: YT.SphericalProperties = player.getSphericalProperties();

  let data = {
    auto_play: queryParamPresentAndEnabled(YTQueryStringParameter.AUTOPLAY, eventData.params),
    avaliable_playback_rates: player.getAvailablePlaybackRates(),
    controls: queryParamPresentAndEnabled(YTQueryStringParameter.CONTROLS, eventData.params),
    current_time: player[YTEntityFunction.CURRENTTIME](),
    default_playback_rate: 1,
    duration: player[YTEntityFunction.DURATION](),
    loaded: player[YTEntityFunction.VIDEOLOADEDFRACTION](),
    muted: player[YTEntityFunction.MUTED](),
    origin: queryParamPresentAndEnabled(YTQueryStringParameter.ORIGIN, eventData.params),
    playback_rate: player[YTEntityFunction.PLAYBACKRATE](),
    playlist_index: player[YTEntityFunction.PLAYLISTINDEX](),
    playlist: player[YTEntityFunction.PLAYLIST](),
    url: player[YTEntityFunction.VIDEOURL](),
    volume: player[YTEntityFunction.VOLUME](),
    loop: queryParamPresentAndEnabled(YTQueryStringParameter.LOOP, eventData.params),
    ...playerState,
    ...eventData.customData,
    ...spherical,
  };

  return {
    schema: 'iglu:org.google/youtube/jsonschema/1-0-0',
    data: data,
  };
}
