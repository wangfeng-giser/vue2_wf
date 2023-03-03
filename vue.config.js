const { defineConfig } = require("@vue/cli-service");
const path = require("path");
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "./",
  // 输出文件目录
  outputDir: "dist",
  // eslint-loader 是否在保存的时候检查
  lintOnSave: true,
  configureWebpack: (config) => {
    config.module.rules.push({
      test: /\.(glb)$/,
      use: [
        {
          loader: "url-loader",
        },
      ],
    });
    config.module.rules.push({
      test: /\.(gltf)$/,
      use: [
        {
          loader: "url-loader",
        },
      ],
    });
    config.resolve = {
      alias: {
        "@": path.join(__dirname, "./src"),
        "@public": path.join(__dirname, "./public"),

        vue: "vue/dist/vue.esm.js",
      },
    };
  },
  devServer: {
    host: "0.0.0.0",
    open: false,
    port: 9527,
    https: false, // By default, dev-server will be served over HTTP.
    proxy: {
      // 配置跨域
      // "/test": {
      //   target: "http://airia.nat100.top/api/drone/app", //请求后台接口
      //   changeOrigin: true, // 允许跨域
      //   pathRewrite: {
      //     "^/test": "", // 重写请求
      //   },
      // },
    },
  },
});
