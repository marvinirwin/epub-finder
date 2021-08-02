export const changeLog: { message: string, date: Date }[] = [
    ["Sat Jul 03 2021 9:01:2 GMT-0700 (Pacific Daylight Time)", `Added ChangeLog`],
    ["Sat Jul 03 2021 9:11:45 GMT-0700 (Pacific Daylight Time)", `Removed safari support because I couldn't decode audio data, or autoplay :(`],
    ["Sat Jul 03 2021 10:12:22 GMT-0700 (Pacific Daylight Time)", `Restore example sentences`],
    ["Sat Jul 03 2021 10:54:21 GMT-0700 (Pacific Daylight Time)", `Added highlight debug elements in dev`],
    ["Sat Jul 03 2021 10:59:49 GMT-0700 (Pacific Daylight Time)", `Added way to contact me`],
    ['Sun Jul 04 2021 13:02:12 GMT-0700 (Pacific Daylight Time)', `Fixed blank quiz screen for new users with startWith`],
    ["Sun Jul 04 2021 13:23:11 GMT-0700 (Pacific Daylight Time)", `Clarified addMore dialog`],
    ["Sun Jul 04 2021 14:41:04 GMT-0700 (Pacific Daylight Time)", `More detailed timestamps on the changeLog`],
    ["Sun Jul 04 2021 14:51:20 GMT-0700 (Pacific Daylight Time)", `Made "add or select" text reflect the presence of library books `],
    ["Thu Jul 08 2021 20:08:21 GMT-0700 (Pacific Daylight Time)", `Added Maximum Reviews Per Day and Only Review Present Words settings`],
    ["Thu Jul 15 2021 13:27:43 GMT-0700 (Pacific Daylight Time)", `Added "no sound" setting`],
    ["Sun Aug 01 2021 20:22:21 GMT-0700 (Pacific Daylight Time)", `Added leader board`],
].map(([date, message]) => ({
    message,
    date: new Date(date),
})).reverse();