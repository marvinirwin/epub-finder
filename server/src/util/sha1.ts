import crypto from "crypto";

export function sha1(key: any): string {
    const sha = crypto.createHash("sha1");
    if (typeof key === 'string') {
        sha.update(key)
    } else {
        sha.update(JSON.stringify(key))
    }
    return sha.digest("hex");
}