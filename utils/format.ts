import { BigNumberish, utils } from 'ethers';
import { roundUp } from './math';

export const formatEtherPrice = (wei: BigNumberish) => {
  return roundUp(
    (Number.parseFloat(utils.formatEther(wei)) * 100000) / 100000,
    3
  );
};
