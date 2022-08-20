import { pbkdf2 } from "pbkdf2";

import * as base64 from "@juanelas/base64";

export const pbkdf2Async = async (
  password: string,
  salt: string,
  iterations: number,
  keylen: number,
  digest: string
): Promise<Error | string> => {
  return new Promise((res, rej) => {
    pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
      err ? rej(err) : res(base64.encode(derivedKey, true, false));
    });
  });
};
