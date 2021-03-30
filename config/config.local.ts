import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};

  config.componentPath = 'D://code//componentPathTo';
  config.desName = 'description.json';

  return config;
};
