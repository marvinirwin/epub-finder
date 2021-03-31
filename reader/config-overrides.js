const { alias, configPaths } = require('react-app-rewire-alias')
module.exports = function override(config, env) {
    alias(configPaths('./tsconfig.paths.json'))(config)
    // Disable eslint-loader
    config.module.rules.splice(1, 1)
    return config
}
