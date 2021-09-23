import { DocumentEvent, TextTrackEvent } from './mediaEvents';
import { TextTrackObject } from './types';

export function timeRangesToObjectArray(t: TimeRanges): { start: number; end: number }[] {
  let out = [];
  for (let i = 0; i < t.length; i++) {
    out.push({ start: t.start(i), end: t.end(i) });
  }
  return out;
}

export function textTrackListToJson(textTrackList: TextTrackList): TextTrackObject[] {
  let out: TextTrackObject[] = [];
  for (let o of Object.keys(textTrackList)) {
    let i = parseInt(o);
    out.push({
      label: textTrackList[i].label,
      language: textTrackList[i].language,
      kind: textTrackList[i].kind,
      mode: textTrackList[i].mode,
    });
  }
  return out;
}

export function isTypeTextTrackEvent(e: string): boolean {
  let fields: string[] = Object.keys(TextTrackEvent);
  return fields.indexOf(e) !== -1;
}

export function isTypeDocumentEvent(e: string): boolean {
  let fields: string[] = Object.keys(DocumentEvent);
  return fields.indexOf(e) !== -1;
}

export function isArrayOutOfBounds(arr: number[]): boolean {
  return arr.filter((a) => a < 0 || 100 < a).length !== 0;
}

export function isDuplicatesInArray(arr: number[]): boolean {
  return arr.filter((el, i) => arr.indexOf(el) !== i).length !== 0;
}

export function isElementFullScreen(mediaId: string): boolean {
  if (document.fullscreenElement) {
    return document.fullscreenElement.id === mediaId;
  }
  return false;
}

// IE doesn't support Object().values (or Number.isInteger), so enumKeys and enumValues are needed for TS
// to be happy about getting enum values

Number.isInteger =
  Number.isInteger ||
  function (value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
  };

export function enumKeys<T>(enumObj: T): string[] {
  return Object.keys(enumObj).filter((k) => !Number.isInteger(k));
}

export function enumValues<T>(enumObj: T): T[keyof T][] {
  return enumKeys(enumObj).map((k) => enumObj[k as keyof T]);
}

export function getAllUrlParams(url: string): { [index: string]: string[] | string | number } {
  let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  let obj: { [index: string]: string[] | string } = {};

  if (queryString) {
    queryString = queryString.split('#')[0];
    let arr = queryString.split('&');

    for (let i = 0; i < arr.length; i++) {
      let a = arr[i].split('=');
      let pName = a[0];
      let pValue = typeof a[1] === 'undefined' ? true : a[1];

      pName = pName.toLowerCase();
      if (typeof pValue === 'string') pValue = pValue.toLowerCase();

      if (pName.match(/\[(\d+)?\]$/)) {
        let key = pName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        if (pName.match(/\[\d+\]$/)) {
          let index: number = parseInt(/\[(\d+)\]/.exec(pName)![1]);
          (obj[key] as string[])[index] = pValue as string;
        } else {
          (obj[key] as string[]).push(pValue as string);
        }
      } else {
        if (!obj[pName]) {
          obj[pName] = pValue as string;
        } else if (obj[pName] && typeof obj[pName] === 'string') {
          obj[pName] = [obj[pName] as string];
          (obj[pName] as string[]).push(pValue as string);
        } else {
          (obj[pName] as string[]).push(pValue as string);
        }
      }
    }
  }

  return obj;
}

export function percentBoundryErrorHandling(percentBoundries: number[]) {
  if (isArrayOutOfBounds(percentBoundries)) {
    let outsideBoundry = percentBoundries.filter((p: number) => p < 0 || 100 < p);
    console.error(
      `Percent bounds must be 1 - 100 inclusive. The following values have been removed: [${outsideBoundry}]`
    );
    for (let p of outsideBoundry) {
      percentBoundries.splice(percentBoundries.indexOf(p), 1);
    }
  }

  if (isDuplicatesInArray(percentBoundries)) {
    let duplicates = percentBoundries.filter((el: number, i: number) => percentBoundries!.indexOf(el) !== i);
    console.error(
      `You have duplicate values in the percent boundry array: [${percentBoundries}]\nThe following values have been removed: [${duplicates}]`
    );
    for (let d of duplicates) {
      percentBoundries.splice(percentBoundries.indexOf(d), 1);
    }
  }
}
