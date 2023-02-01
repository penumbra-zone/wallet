import {Asset} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb";

export type BackgroundType = {
  addKey: (key: { [key: string]: any }) => void;
  approve: (id: string, index: number) => void;
  deleteVault: () => void;
  initVault: (password: string, mnemonic: string) => void;
  lock: () => void;
  reject: (id: string) => void;
  removeKey: (index: number) => void;
  state: {
    isInitialized: boolean;
    isWrongPass: boolean;
    keys: any[];
    isLocked: boolean;
  };
  unlock: (password: string) => void;
};

export type EncodeAsset = Asset & {
  decodeId: string;
};
