export declare type OrderModel = {
  id: string;
  createTime: number;
  lastUpdate: number;
  limit: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  status: number;
  revert_id: string | undefined;
};
