import crypto from "crypto";

export function getSha1(key: string): string {
    const sha = crypto.createHash("sha1");
    sha.update(key);
    return sha.digest("hex");
}