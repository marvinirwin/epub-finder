const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    { name: "storybook-preset-craco", }
    /*
        {
          name: "@storybook/addon-postcss",
          options: {
            postcssLoaderOptions: {
              implementation: require("postcss")
            }
          }
        }
    */
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  },
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: "postcss-loader",
          options: {
            postcssOptions: {
              plugins: [require("tailwindcss"), require("autoprefixer")]
            }
          }
        }
      ],
      include: path.resolve(__dirname, "../")
    });
    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        extensions: [...config.resolve.extensions, ".ts", ".tsx"],
        configFile: "./tsconfig.paths.json"
      })

    ];
    const shared = path.resolve(__dirname, "../../server/src/shared");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@shared": shared
    };
    return config;
  }
};