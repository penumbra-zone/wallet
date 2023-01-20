import ObservableStore from 'obs-store';
import { ExtensionStorage } from '../storage';
import { extension } from './extension';

const NOTIFICATION_HEIGHT = 600;
const NOTIFICATION_WIDTH = 400;

function checkForError() {
  const { lastError } = extension.runtime;
  if (!lastError) {
    return undefined;
  }
  // if it quacks like an Error, its an Error
  if (lastError.message) {
    return lastError;
  }
  // repair incomplete error object (eg chromium v77)
  return new Error(lastError.message);
}

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

  getLastFocusedWindow(): Promise<chrome.windows.Window> {
    return new Promise((resolve, reject) => {
      extension.windows.getLastFocused().then((windowObject) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(windowObject);
      });
    });
  }

  openWindow(options) {
    return new Promise((resolve, reject) => {
      extension.windows.create(options, (newWindow) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
  }

  async showWindow() {
    const { inShowMode } = this.store.getState();

    if (inShowMode) {
      return null;
    }
    let left = 0;
    let top = 0;

    this.store.updateState({ inShowMode: true });
    const notificationWindow = await this._getNotificationWindow();

    if (notificationWindow) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      extension.windows.update(notificationWindow.id!, {
        focused: true,
      });
    } else {
      try {
        const lastFocused = await this.getLastFocusedWindow();

        // Position window in top right corner of lastFocused window.
        top = lastFocused.top;
        left = lastFocused.left + (lastFocused.width - NOTIFICATION_WIDTH);
      } catch (_) {
        // The following properties are more than likely 0, due to being
        // opened from the background chrome process for the extension that
        // has no physical dimensions
        const { screenX, screenY, outerWidth } = window;
        top = Math.max(screenY, 0);
        left = Math.max(screenX + (outerWidth - NOTIFICATION_WIDTH), 0);
      }

      const popupWindow = await this.openWindow({
        url: 'notification.html',
        type: 'popup',
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        left,
        top,
      });
    }

    this.store.updateState({ inShowMode: false });
  }

  async resizeWindow(width: number, height: number) {
    const notificationWindow = await this._getNotificationWindow();
    if (notificationWindow) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await extension.windows.update(notificationWindow.id!, {
        width,
        height,
      });
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
