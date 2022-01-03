export const getRequiredEnvironmentVariables = <
  T extends { [key: string]: string },
>(
  ...keys: Array<keyof T>
): T => {
  const unsetVariables = keys.filter((key) => !process.env[key as string]);
  if (unsetVariables.length) {
    throw new Error(
      `The following environment variables are not set ${unsetVariables.join(
        ', ',
      )}`,
    );
  }
  const variables = Object.fromEntries(
    keys.map((key) => [key, process.env[key as string]]),
  ) as T;
  console.log(JSON.stringify(variables, null, '  '));
  return variables;
};
