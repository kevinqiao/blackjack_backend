import { SupportedChainId, Token } from '@uniswap/sdk-core';
const mainnet = {
  amountIn: 0.0001,
  chain_id: SupportedChainId.MAINNET,
  tokens: [
    {
      symbol: 'WETH',
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    },
    {
      symbol: 'USDT',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    },
    {
      symbol: 'USDC',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
    {
      symbol: 'WMATIC',
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    },
    {
      symbol: 'MATIC',
      address: '0x0000000000000000000000000000000000001010',
    },
  ],
  walletAddress: '0xE643a2E29F0D2e5B5833355c862B1D2120DC8F18',
  API_URL:
    'https://polygon-mainnet.g.alchemy.com/v2/XYZgBk7guns7RrhxZk_Vid3vAIZT4TMA',
  PRIVATE_KEY:
    '549decabb3bf8db8e5db3afae72dce7acaea1c6787891a9b717a89d739cc5da9',
  UNISWAP_FACTORY_ADDRESS: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  QUOTER_CONTRACT_ADDRESS: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
};
const polygon = {
  amountIn: 0.0001,
  chain_id: SupportedChainId.POLYGON,
  tokens: [
    {
      symbol: 'WETH',
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    },
    {
      symbol: 'USDT',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    },
    {
      symbol: 'USDC',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
    {
      symbol: 'WMATIC',
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    },
    {
      symbol: 'MATIC',
      address: '0x0000000000000000000000000000000000001010',
    },
  ],
  walletAddress: '0xE643a2E29F0D2e5B5833355c862B1D2120DC8F18',
  API_URL:
    'https://polygon-mainnet.g.alchemy.com/v2/XYZgBk7guns7RrhxZk_Vid3vAIZT4TMA',
  PRIVATE_KEY:
    '549decabb3bf8db8e5db3afae72dce7acaea1c6787891a9b717a89d739cc5da9',
  UNISWAP_FACTORY_ADDRESS: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  QUOTER_CONTRACT_ADDRESS: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
};
// const Config = (function () {
//   console.log(process.env.chain);
//   switch (process.env.chain) {
//     case 'mainnet':
//       return mainnet;
//     case 'polygon':
//       return polygon;
//     default:
//       return polygon;
//   }
// })();
const Config = {
  mainnet,
  polygon,
};
export default Config;
