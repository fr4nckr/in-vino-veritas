import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  hardhat
} from 'wagmi/chains'; 

import { http } from 'viem';

export const config = getDefaultConfig({
  appName: 'InVinoVeritas DApp',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    hardhat, 
    //sepolia
  ],
  ssr: true,
});