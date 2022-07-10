const { CracoAliasPlugin } = require("react-app-alias-ex");
const babelInclude = require('@dealmore/craco-plugin-babel-include');

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
    configure: webpackConfig => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === "ModuleScopePlugin"
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      return webpackConfig;
    }
  }
};
