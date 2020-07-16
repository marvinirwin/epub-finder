import crypto from "crypto";

export function getSha1(key: string): string {
    const sha = crypto.createHash("sha1");
    sha.update(key);
    const sha1Hex = sha.digest("hex");
    return sha1Hex;
}