import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
  hardhat,
  sepolia
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Test demo',
  projectId: '60ee9c4c12525621e08de2d51183f630',
  chains: [
    hardhat,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

