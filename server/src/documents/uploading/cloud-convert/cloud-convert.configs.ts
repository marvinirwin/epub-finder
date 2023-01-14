import CloudConvert from "cloudconvert";
import { disabledService, entirelyDisabledService, wrapService } from "../../../util/ServiceWrapper";

const ENABLE_CLOUD_CONVERT_NORMAL = "ENABLE_CLOUD_CONVERT_NORMAL";
export const cloudConvertMockService = () => ({
  jobs: {
    wait: disabledService(ENABLE_CLOUD_CONVERT_NORMAL)
  }
});

export const cloudConvertRegular = wrapService({
  key: ENABLE_CLOUD_CONVERT_NORMAL,
  realService: () => new CloudConvert(
    process.env.CLOUD_CONVERT_API_KEY,
    false
  ),
  mockService: cloudConvertMockService
});

const ENABLE_CLOUD_CONVERT_SANDBOX = "ENABLE_CLOUD_CONVERT_SANDBOX";
export const cloudConvertSandbox = wrapService(
  {
    key: ENABLE_CLOUD_CONVERT_SANDBOX,
    realService: () => new CloudConvert(
      process.env.SANDBOX_CLOUD_CONVERT_API_KEY,
      true
    ),
    mockService: entirelyDisabledService<typeof >(ENABLE_CLOUD_CONVERT_SANDBOX)
  }
);
