import EventEmitter from 'events';
import LocalMessageDuplexStream from 'post-message-stream';
import { equals } from 'ramda';
import { cbToPromise, setupDnode, transformMethods } from './lib';

function createDeffer<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    resolve: resolve!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    reject: reject!,
  };
}

setupInpageApi();

async function setupInpageApi() {
  let cbs: Record<string, unknown> = {};
  let args: Record<string, unknown[]> | unknown[] = {};
  const penumbraAppDef = createDeffer();
  const penumbraApp = {};
  const eventEmitter = new EventEmitter();

  const penumbraApi: Record<string, unknown> = {
    initialPromise: penumbraAppDef.promise,
    on: eventEmitter.on.bind(eventEmitter),
  };
  const proxyApi = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(_: any, prop: string) {
      if (penumbraApi[prop]) {
        return penumbraApi[prop];
      }

      if (!cbs[prop] && prop !== 'on') {
        cbs[prop] = function (...args: unknown[]) {
          const def = createDeffer();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args as any)[prop] = (args as any)[prop] || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args as any)[prop].push({ args, def });
          return def.promise;
        };
      }

      if (!cbs[prop] && prop === 'on') {
        cbs[prop] = function (...args: unknown[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args as any)[prop] = (args as any)[prop] || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args as any)[prop].push({ args });
        };
      }

      return cbs[prop];
    },

    set() {
      throw new Error('Not permitted');
    },

    has() {
      return true;
    },
  };

  (global as any).penumbra = new Proxy(penumbraApp, proxyApi);

  const connectionStream = new LocalMessageDuplexStream({
    name: 'penumbra_page',
    target: 'penumbra_content',
  });

  const dnode = setupDnode(
    connectionStream,
    {},
    'inpageApi',
    'updatePublicState'
  );

  const inpageApi = await new Promise((resolve) => {
    dnode.on('remote', (inpageApi) => {
      resolve(transformMethods(cbToPromise, inpageApi));
    });
  });

  Object.entries(args).forEach(([prop, data]: [string, any]) => {
    if (data.def) {
      inpageApi[prop](...data.args).then(data.def.resolve, data.def.reject);
    } else {
      inpageApi[prop](...data.args);
    }
  });

  args = [];
  cbs = {};

  Object.assign(penumbraApi, inpageApi);
  penumbraAppDef.resolve(penumbraApi);
  (global as any).penumbra = penumbraApi;

  let publicState = {};

  connectionStream.on('data', async ({ name }) => {
    if (name !== 'updatePublicState') return;

    const isApproved = await (penumbraApi as any).resourceIsApproved();
    if (!isApproved) {
      return;
    }

    const updatedPublicState = await (penumbraApi as any).publicState();

    if (!equals(updatedPublicState, publicState)) {
      publicState = updatedPublicState;
      eventEmitter.emit('update', updatedPublicState);
    }
  });
}
