import { reaction } from 'mobx';
import { extensionApi } from './utils/extensionApi';
import { PortStream } from './utils/PortStream';
import { PenumbraController } from './penumbra-controller';
import { loadState, saveState } from './utils/localStorage';
import { getCompactBlockRange } from './utils';

const DEV_MODE = process.env.NODE_ENV !== 'production';
const IDLE_INTERVAL = 30;

setupApp();

async function setupApp() {
  const initState = await loadState();
  const app = new PenumbraController(initState);

  if (DEV_MODE) {
    global.app = app;
  }

  // Setup state persistence
  reaction(
    () => ({
      vault: app.store.vault,
    }),
    saveState
  );

  // update badge
  reaction(
    () =>
      app.store.newMessages.length > 0
        ? app.store.newMessages.length.toString()
        : '',
    (text) => extensionApi.action.setBadgeText({ text }),
    { fireImmediately: true }
  );

  // Lock on idle
  extensionApi.idle.setDetectionInterval(IDLE_INTERVAL);
  extensionApi.idle.onStateChanged.addListener((state) => {
    if (['locked', 'idle'].indexOf(state) > -1) {
      app.lock();
    }
  });

  // Connect to other contexts
  extensionApi.runtime.onConnect.addListener(connectRemote);

  function connectRemote(remotePort) {
    const processName = remotePort.name;
    const portStream = new PortStream(remotePort);
    if (processName === 'contentscript') {
      const origin = remotePort.sender.url;
      app.connectPage(portStream, origin);
    } else {
      app.connectPopup(portStream);
    }
  }

  getCompactBlockRange();
}
