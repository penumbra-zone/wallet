import { extensionApi } from './extensionApi';

export const loadState = async () => {
  try {
    const state = await extensionApi.storage.local.get('store');

    return state || undefined;
  } catch (error) {
    console.log('loadState error:', error);
    return undefined;
  }
};
export const saveState = (store) => {
  extensionApi.storage.local.set({ store });
};
