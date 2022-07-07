const { CracoAliasPlugin } = require("react-app-alias-ex");

module.exports = {
  plugins: [
    {
      plugin: CracoAliasPlugin,
      options: {}
    },
    {
      plugin: ["@babel/plugin-proposal-decorators"],
      options: {}
    }
  ],
  webpack: {
    configure: webpackConfig => {
/*
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === "ModuleScopePlugin"
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      console.log(webpackConfig.module[1]);
      return webpackConfig;
      const typescriptRule = webpackConfig.module.rules.find(rule => Object.keys(rule).find(v => v === 'include'));
      console.log(typescriptRule);
      typescriptRule.include = ['./src', './node_modules']
*/
      return webpackConfig;
    }
  }
};
