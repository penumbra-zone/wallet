export const stringToBytes: (str: string) => Uint8Array = (str: string) => {
  let utf8Encode = new TextEncoder();
  return utf8Encode.encode(str);
};

export const bytesToString: (bytes: Uint8Array) => string = (bytes: Uint8Array) => {
  let utf8Decode = new TextDecoder();
  return utf8Decode.decode(bytes);
};
