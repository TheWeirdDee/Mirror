import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { aeneid } from './chain';

export { aeneid };

export const config = getDefaultConfig({
  appName: 'Mirror Protocol',
  projectId: 'YOUR_PROJECT_ID', // Replace with a real WalletConnect project ID if needed
  chains: [aeneid],
  ssr: true,
});
