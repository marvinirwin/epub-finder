import Twitter from "twitter-lite";

export const getTwitter = async () => {
    const twitterKey = process.env["TWITTER_API_KEY"];
    const twitterSecret = process.env["TWITTER_API_KEY_SECRET"];
    const user = new Twitter({
        // @ts-ignore
        consumer_key: twitterKey,
        // @ts-ignore
        consumer_secret: twitterSecret,
    });
    const response = await user.getBearerToken();
    return new Twitter({
        // @ts-ignore
        bearer_token: response.access_token,
        // @ts-ignore
        consumer_key: twitterKey,
        // @ts-ignore
        consumer_secret: twitterSecret,
    });
};
export const twitterInstance = getTwitter();

export interface LocationsRequest {
    term: string;
    cb: (str: string) => void;
}

/*
export const getLocationsF = memoWithMySQL("TWITTER_TREND_LOCATIONS", async function (args: LocationsRequest) {
    return await (await twitterInstance).get("trends/available");
});
export const getLocations = async (req: Request, res: Response) => {
    const body = JSON.stringify(await getLocationsF(req.body));
    return res.send(body);
};

export interface TrendRequest {
    id: number;
}

export const getTrendForLocationF = memoWithMySQL("TWITTER_TRENDS", async function (args: TrendRequest) {
    return await (await twitterInstance).get("trends/place", {id: args.id});
});
export const getTrendForLocation = async (req: Request, res: Response) => {
    return res.send(JSON.stringify(await getTrendForLocationF(req.body)));
};
*/
