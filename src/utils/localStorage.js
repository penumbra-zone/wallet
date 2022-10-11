import { extensionApi } from './extensionApi';

// export const loadState = () => {
//   try {
//     const state = extensionApi.storage.local.get('store');
//     console.log({ state });
//     return state || undefined;
//   } catch (error) {
//     console.log('loadState error:', error);
//     return undefined;
//   }
// };

const loadState = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      if (result[key] === undefined) {
        reject();
      } else {
        resolve(result[key]);
      }
    });
  });
};
export const saveState = (store) => {
  extensionApi.storage.local.set({ store });
};
