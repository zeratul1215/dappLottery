export interface LotteryState {
  state: 'OPEN' | 'CALCULATING';
  players: string[];
  recentWinner: string;
  playerCount: number;
  lastTimeStamp: bigint;
  interval: bigint;
  entranceFee: bigint;
  owner: string;
}

export interface TransactionStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  hash?: string;
  error?: string;
}

export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
}
