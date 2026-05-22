import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Merath',
  slug: 'merath_mobile',
  scheme: 'merath',
  android: {
    package: 'com.merath_mobile.merath',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          { scheme: 'merath', host: '*', pathPrefix: '/' },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  extra: {
    eas: {
      projectId: 'a524145d-db5e-41df-ac7b-94b4334a3cf5',
    },
  },
});