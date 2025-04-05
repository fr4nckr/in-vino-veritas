import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  sepolia
} from '@/utils/sepolia';

export const config = getDefaultConfig({
  appName: 'Test demo',
  projectId: '65af7ffc03881e7982d909862c11aa59',
  chains: [sepolia as Chain],
  ssr: true,
});
