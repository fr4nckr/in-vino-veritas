import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  hardhat,
  sepolia
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Test demo',
  projectId: 'TEST',
  chains: [
    hardhat,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});
