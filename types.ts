import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export interface FrakCard {
  id: number;
  marketId: BigNumberish | BigNumber;
  name: string;
  image: string;
  createdAt: string;
  countdown?: Date;
  contributions?: BigNumberish | BigNumber;
  collateral: string;
}

export interface NFTItemType {
  creator:string,
  id: number,
  name: string,
  image: string,
  createdAt: number
}
