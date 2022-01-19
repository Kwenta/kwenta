<<<<<<< HEAD
const path = require("path");

=======
>>>>>>> db2f77d1bf6e8677dd0bb8e24de8f74062fd668c
module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
<<<<<<< HEAD
  "framework": "@storybook/react",
  "webpackFinal": async (config) => {
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, "../"),
    ];

    return config;
  },
=======
  "framework": "@storybook/react"
>>>>>>> db2f77d1bf6e8677dd0bb8e24de8f74062fd668c
}