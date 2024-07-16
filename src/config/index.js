/**
 * 环境配置封装
 */
const env = import.meta.env.MODE || "prod";
const EnvConfig = {
  dev: {
    baseApi: "/api",
    mockApi:
      "https://www.fastmock.site/mock/4f8a76c109fe7d95e131ee5a72d23dff/api",
  },
  test: {
    baseApi: "//test.futurefe.com/api",
    mockApi:
      "https://www.fastmock.site/mock/4f8a76c109fe7d95e131ee5a72d23dff/api",
  },
  prod: {
    baseApi: "/api",
    mockApi:
      "https://www.fastmock.site/mock/4f8a76c109fe7d95e131ee5a72d23dff/api",
  },
};
export default {
  env,
  mock: false,
  namespace: "manager",
  ...EnvConfig[env],
};
