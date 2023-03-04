const { CracoAliasPlugin } = require("react-app-alias-ex");
const babelInclude = require('@dealmore/craco-plugin-babel-include');
const {resolve} = require('path');

module.exports = {
  plugins: [
    {
      plugin: CracoAliasPlugin,
      options: {}
    },
    {
      plugin: babelInclude,
      options: {
        include: ['../server/src'],
      },
    },
  ],
  webpack: {
    configure: (webpackConfig, {env, paths}) => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === "ModuleScopePlugin"
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      paths.appBuild = webpackConfig.output.path = resolve('../server/public');
      return webpackConfig;
    }
  },
  babel: {
    plugins: [
      "babel-plugin-transform-typescript-metadata"
    ]
  },
};
