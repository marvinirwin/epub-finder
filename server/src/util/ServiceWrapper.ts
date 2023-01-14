export const wrapService = <T extends any>(
  {
    key,
    realService,
    mockService
  }: {
    key: string;
    realService: () => T;
    mockService: () => T;
  }
) => {
  if (process.env[key] === "true") {
    console.log(`${key} service enabled.  Set the environment variable ${key}=false to disable it`);
    return realService();
  }
  console.log(`${key} service is not enabled and is being mocked.  Set the environment variable ${key}=true to enable it it`);
  return mockService();
};

export const disabledService = <P, R>(key: string): ((p: P) => R) => () => {
  throw Error(`This service is currently disabled Set the environment variable ${key}=true to enable it`);
};
export const entirelyDisabledService  = <T extends object>(key: string): (() => T) => () => {
  return new Proxy<T>({} as T,
    {
      get() {
        throw new Error(`This service is currently disabled Set the environment variable ${key}=true to enable it`);
      }
    }
  );
};