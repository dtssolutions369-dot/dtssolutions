import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dtssolutions.app',
  appName: 'DTS Solutions',
  webDir: 'out',
  server: {
    url: 'https://dtssolutions.vercel.app',
    cleartext: true
  }
};

export default config;