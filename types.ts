import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export interface FrakCard {
  id: number;
  name: string;
  imageURL: string;
  createdAt: string;
  countdown?: Date;
  contributions?: BigNumberish | BigNumber;
}

export interface NFTItemType {
  creator:string,
  id:number,
  name:string,
  imageURL:string,
  createdAt:number
};
