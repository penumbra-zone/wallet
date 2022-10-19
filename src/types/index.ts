export type BackgroundType = {
  addKey: (key: { [key: string]: any }) => void;
  approve: (id: string, index: number) => void;
  deleteVault: () => void;
  initVault: (password: string, mnemonic: string) => void;
  lock: () => void;
  reject: (id: string) => void;
  removeKey: (index: number) => void;
  state: {
    initialized: boolean;
    isWrongPass: boolean;
    keys: any[];
    locked: boolean;
  };
  unlock: (password: string) => void;
};
