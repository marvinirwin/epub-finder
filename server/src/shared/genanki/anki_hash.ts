import crypto from "crypto";

const h = crypto.createHash("sha256");

const BASE91_TABLE = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
  "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
  "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4",
  "5", "6", "7", "8", "9", "!", "#", "$", "%", "&", "(", ")", "*", "+", ",", "-", ".", "/", ":",
  ";", "<", "=", ">", "?", "@", "[", "]", "^", "_", "`", "{", "|", "}", "~"];

export function ankiHash(fields) {
  const str = fields.join("__");
  h.update(str);
  const hex = h.digest();

  let hash_int = BigInt();
  for (let i = 0; i < 8; i++) {
    hash_int *= BigInt(256);
    hash_int += BigInt(hex[i]);
  }

  // convert to the weird base91 format that Anki uses
  const rv_reversed = [];
  while (hash_int > 0) {
    // @ts-ignore
    rv_reversed.push(BASE91_TABLE[hash_int % BigInt(91)]);
    hash_int = (hash_int / BigInt(91));
  }

  return rv_reversed.reverse().join("");
}
