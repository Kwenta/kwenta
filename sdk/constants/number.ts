import { wei } from '@synthetixio/wei';
import BN from 'bn.js';
import { BigNumber } from 'ethers';

export const ZERO_WEI = wei(0);

export const UNIT_BN = new BN('10').pow(new BN(18));
export const UNIT_BIG_NUM = BigNumber.from('10').pow(18);
export const ZERO_BIG_NUM = BigNumber.from('0');
