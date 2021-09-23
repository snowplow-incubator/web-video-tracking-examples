import App from "./App";

export function addEventToUI(mediaEvent: any, app: App, mediaId: any) {
    // A deep copy is needed here, as the event JSON shown on the right pane would otherwise be a reference to the
    // element, meaning the top most event could be changed by manipulating the properties of the media element
    let deepCopy = {
        event: JSON.parse(JSON.stringify(mediaEvent)),
        context: JSON.parse(JSON.stringify(mediaEvent.context)),
      };
      let newState = { ...app.state.videoData };
      if (app.state.videoData.hasOwnProperty(mediaId)) {
        newState[mediaId].push(deepCopy);
      } else {
        newState[mediaId] = [deepCopy];
      }
      app.setState({ videoData: newState });
    }

    //    addEventToUI(playerEvent, app, mediaId);
