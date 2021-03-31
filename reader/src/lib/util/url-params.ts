export const TESTING = new URLSearchParams(window.location.search).has("test");
export const DEV = new URLSearchParams(window.location.search).has("dev");
export const SHOW_INTRO = new URLSearchParams(window.location.search).has(
  "showIntro"
);
