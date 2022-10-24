import {
  cbToPromise,
  extension,
  PortStream,
  setupDnode,
  transformMethods,
} from '../lib';
import backgroundService, {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from './services/Background';

startUi();

async function startUi() {
  console.log('asdasd');

  extension.storage.onChanged.addListener(async (changes, area) => {
    console.log(area);

    if (area !== 'local') {
      return;
    }

    const stateChanges: Partial<Record<string, unknown>> &
      Partial<BackgroundGetStateResult> = await backgroundService.getState([
      'initialized',
      'locked',
    ]);

    for (const key in changes) {
      stateChanges[key] = changes[key].newValue;
    }
  });

  const emitterApi = {
    closePopupWindow: async () => {
      const popup = extension.extension
        .getViews({ type: 'popup' })
        .find((w) => w.location.pathname === '/popup.html');

      if (popup) {
        popup.close();
      }
    },
  };

  const connect = async () => {
    const port = extension.runtime.connect();

    port.onDisconnect.addListener(() => {
      backgroundService.setConnect(async () => {
        const newBackground = await connect();
        backgroundService.init(newBackground);
      });
    });

    const connectionStream = new PortStream(port);
    const dnode = setupDnode(connectionStream, emitterApi, 'api');
    return await new Promise<BackgroundUiApi>((resolve) => {
      dnode.once('remote', (background: Record<string, unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolve(transformMethods(cbToPromise, background) as any);
      });
    });
  };

  const background = await connect();

  const [state] = await Promise.all([background.getState()]);

  if (!state.initialized) {
    background.showTab(window.location.origin + '/accounts.html', 'accounts');
  }

  backgroundService.init(background);

  document.addEventListener('mousemove', () => backgroundService.updateIdle());
  document.addEventListener('keyup', () => backgroundService.updateIdle());
  document.addEventListener('mousedown', () => backgroundService.updateIdle());
  document.addEventListener('focus', () => backgroundService.updateIdle());
}
