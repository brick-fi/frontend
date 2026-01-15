import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mantleSepoliaTestnet } from 'wagmi/chains';
import { defineChain } from 'viem';

// Local Anvil chain
export const localhost = defineChain({
  id: 31337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
});

const isDevelopment = process.env.NODE_ENV === 'development'

export const config = getDefaultConfig({
  appName: 'BrickFi',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: isDevelopment ? [localhost] : [mantleSepoliaTestnet],
  ssr: true,
});
