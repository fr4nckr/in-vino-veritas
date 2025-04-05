import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  sepolia
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Test demo',
  projectId: '60ee9c4c12525621e08de2d51183f630',
  chains: [sepolia],
  ssr: true,
});

