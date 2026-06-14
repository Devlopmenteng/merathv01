import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Merath',
  slug: 'merath_mobile',
  scheme: 'merath',
  owner: 'smartengineer',
  android: {
    package: 'com.merath_mobile.merath',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'merath', host: '*', pathPrefix: '/' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  extra: {
    eas: {
      projectId: '2c2de43d-16e9-4c3f-88b6-be678d534494',
    },
  },
});
