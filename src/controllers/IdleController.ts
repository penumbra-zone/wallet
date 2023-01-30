import ObservableStore from 'obs-store';
import { extension } from '../lib';
import { ExtensionStorage } from '../storage';
import { VaultController } from './VaultController';

export interface IdleOptions {
  type: string;
  interval?: number;
}

const IDLE_INTERVAL = 30 * 60;

export class IdleController {
  private options: IdleOptions;
  private vaultController;
  private store;
  private lastUpdateIdle;

  constructor({
    extensionStorage,
    vaultController,
  }: {
    extensionStorage: ExtensionStorage;
    vaultController: VaultController;
  }) {
    extension.idle.setDetectionInterval(IDLE_INTERVAL);
    this.options = {
      type: 'idle',
    };

    this.vaultController = vaultController;
    this.store = new ObservableStore(
      extensionStorage.getInitState({ lastUpdateIdle: Date.now() })
    );
    this.lastUpdateIdle = this.store.getState().lastUpdateIdle;
    extensionStorage.subscribe(this.store);
    this.start();

    extension.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'idle') {
        this.start();
      }
    });
  }

  setOptions(options: IdleOptions) {
    this.options = { ...this.options, ...options };
    this.start();
  }

  start() {
    this._idleMode();
    this._tmrMode();
  }

  update() {
    this.lastUpdateIdle = Date.now();
    this.store.updateState({ lastUpdateIdle: this.lastUpdateIdle });
    this.start();
  }

  private _tmrMode() {
    if (this.options.type === 'idle') return;

    const time = Date.now() - this.lastUpdateIdle - this.options.interval;
    if (time > 0) this._lock('locked');

    extension.alarms.create('idle', {
      delayInMinutes: 5 / 60,
    });
  }

  private _idleMode() {
    if (this.options.type !== 'idle') {
      extension.idle.onStateChanged.removeListener(this._lock);
    } else {
      extension.idle.onStateChanged.addListener(this._lock);
    }
  }

  _lock = (state: string) => {
    console.log({ state });
    
    if (['idle', 'locked'].indexOf(state) > -1) {
      this.vaultController.lock();
    }
  };
}
