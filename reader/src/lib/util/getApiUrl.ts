export const getApiUrl = (path: string) => {
  const publicUrl = process.env.PUBLIC_URL;
  if (publicUrl)  {
    return `${publicUrl}/${path}`
  }
  return path;
}