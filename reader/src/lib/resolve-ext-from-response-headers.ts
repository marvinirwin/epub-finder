export function resolveExtFromResponseHeaders(response: Response): string | undefined {
    const map: { [key: string]: string } = {
        'image/jpeg': 'jpeg',
        'image/png': 'png',
        'image/gif': 'gif',
    };
    return map[response.headers.get('content-type') as string] || undefined;
}