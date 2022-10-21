import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { BrowserRouter } from 'react-router-dom';
import {
  cbToPromise,
  extension,
  PortStream,
  setupDnode,
  transformMethods,
} from '../lib';
import backgroundService, { BackgroundUiApi } from './services/Background';

import { createUiStore } from './store';
import { Provider } from 'react-redux';

startUi();

async function startUi() {
  const store = createUiStore({
    version: extension.runtime.getManifest().version,
  });
  const root = ReactDOM.createRoot(
    document.getElementById('app-content') as HTMLElement
  );
  root.render(
    <Provider store={store}>
      <div>asdasda</div>
    </Provider>
  );

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
}
