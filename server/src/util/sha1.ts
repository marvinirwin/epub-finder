import crypto from "crypto";

export function sha1(key: any): string {
    const sha = crypto.createHash("sha1");
    sha.update(JSON.stringify(key))
    return sha.digest("hex");
}