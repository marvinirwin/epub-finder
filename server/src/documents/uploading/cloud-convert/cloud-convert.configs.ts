import CloudConvert from "cloudconvert";

export const cloudConvertRegular = new CloudConvert(
    process.env.CLOUD_CONVERT_API_KEY,
    false
);
export const cloudConvertSandbox = new CloudConvert(
    process.env.SANDBOX_CLOUD_CONVERT_API_KEY,
    true
);




