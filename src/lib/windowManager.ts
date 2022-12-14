import ObservableStore from 'obs-store';
import { ExtensionStorage } from '../storage';
import { extension } from './extension';

const height = 600;
const width = 400;

export class WindowManager {
  private store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        notificationWindowId: undefined,
        inShowMode: undefined,
      })
    );

    extensionStorage.subscribe(this.store);
  }

  async showWindow() {
    const { inShowMode } = this.store.getState();

    if (inShowMode) {
      return null;
    }

    this.store.updateState({ inShowMode: true });
    const notificationWindow = await this._getNotificationWindow();

    if (notificationWindow) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      extension.windows.update(notificationWindow.id!, { focused: true });
    } else {
      // create new notification popup
      await new Promise<void>((resolve) => {
        extension.windows.create(
          {
            url: 'notification.html',
            type: 'popup',
            focused: true,
            width,
            height,
          },
          (window) => {
            this.store.updateState({ notificationWindowId: window?.id });
            resolve();
          }
        );
      });
    }

    this.store.updateState({ inShowMode: false });
  }

  async resizeWindow(width: number, height: number) {
    const notificationWindow = await this._getNotificationWindow();
    if (notificationWindow) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await extension.windows.update(notificationWindow.id!, { width, height });
    }
  }

  async closeWindow() {
    const notificationWindow = await this._getNotificationWindow();
    if (notificationWindow) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-console
      extension.windows.remove(notificationWindow.id!, console.error);
      this.store.updateState({ notificationWindowId: undefined });
    }
  }

  async _getNotificationWindow() {
    // get all extension windows
    const windows = await new Promise<chrome.windows.Window[]>((resolve) =>
      extension.windows.getAll({}, (windows) => {
        resolve(windows || []);
      })
    );

    const { notificationWindowId } = this.store.getState();

    // find our ui window
    return windows.find(
      (window) => window.type === 'popup' && window.id === notificationWindowId
    );
  }
}
