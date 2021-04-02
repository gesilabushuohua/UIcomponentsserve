import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1615910701806_1635';

  // add your egg config in here
  config.middleware = [];

  // enable file mode
  /*  config.multipart = {
    mode: 'file',
    // add whitelist
    fileExtensions: [ '.vue', '.md' ],
  }; */

  // error handler
  config.onerror = {
    all(err: any, ctx: any) {
      ctx.msg = err;
      ctx.status = 500;
    },
  };

  const types = {
    html: 1,
    vue: 2,
    react: 3,
    1: 'html',
    2: 'vue',
    3: 'react',
  };
  config.types = types;

  const typesArr = [ 'html', 'vue', 'react' ];
  config.typesArr = typesArr;

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.cors = {
    origin: "*", // 跨任何域
    allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS", // 被允许的请求方式
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    // 暂时关闭 CSRF 安全机制
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
