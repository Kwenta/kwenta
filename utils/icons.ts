import AAVEIcon from 'assets/png/currencies/sAAVE.png';
import ADAIcon from 'assets/png/currencies/sADA.png';
import APEIcon from 'assets/png/currencies/sAPECOIN.png';
import AUDIcon from 'assets/png/currencies/sAUD.png';
import AVAXIcon from 'assets/png/currencies/sAVAX.png';
import BNBIcon from 'assets/png/currencies/sBNB.png';
import BTCIcon from 'assets/png/currencies/sBTC.png';
import CHFIcon from 'assets/png/currencies/sCHF.png';
import DOGEIcon from 'assets/png/currencies/sDOGE.png';
import DOTIcon from 'assets/png/currencies/sDOT.png';
import DYDXIcon from 'assets/png/currencies/sDYDX.png';
import ETHIcon from 'assets/png/currencies/sETH.png';
import ETHBTCIcon from 'assets/png/currencies/sETHBTC.png';
import EURIcon from 'assets/png/currencies/sEUR.png';
import GBPIcon from 'assets/png/currencies/sGBP.png';
import INRIcon from 'assets/png/currencies/sINR.png';
import JPYIcon from 'assets/png/currencies/sJPY.png';
import KRWIcon from 'assets/png/currencies/sKRW.png';
import LINKIcon from 'assets/png/currencies/sLINK.png';
import MATICIcon from 'assets/png/currencies/sMATIC.png';
import SNXIcon from 'assets/png/currencies/SNX.png';
import OILIcon from 'assets/png/currencies/sOIL.png';
import SOLIcon from 'assets/png/currencies/sSOL.png';
import UNIIcon from 'assets/png/currencies/sUNI.png';
import USDIcon from 'assets/png/currencies/sUSD.png';
import XAGIcon from 'assets/png/currencies/sXAG.png';
import XAUIcon from 'assets/png/currencies/sXAU.png';
import { CRYPTO_CURRENCY_MAP, SynthsName } from 'constants/currency';

import { FuturesMarketKey } from './futures';

export const SYNTH_ICONS: Record<FuturesMarketKey | SynthsName | string, any> = {
	sBTC: BTCIcon,
	sETH: ETHIcon,
	sLINK: LINKIcon,
	sSOL: SOLIcon,
	sAVAX: AVAXIcon,
	sAAVE: AAVEIcon,
	sUNI: UNIIcon,
	sMATIC: MATICIcon,
	sXAU: XAUIcon,
	sXAG: XAGIcon,
	sEUR: EURIcon,
	sAPE: APEIcon,
	sDYDX: DYDXIcon,
	sWTI: OILIcon,
	sAXS: null,
	sUSD: USDIcon,
	sINR: INRIcon,
	sJPY: JPYIcon,
	sGBP: GBPIcon,
	sCHF: CHFIcon,
	sKRW: KRWIcon,
	sDOT: DOTIcon,
	sETHBTC: ETHBTCIcon,
	sADA: ADAIcon,
	sAUD: AUDIcon,
	sBNB: BNBIcon,
	sDOGE: DOGEIcon,
	[CRYPTO_CURRENCY_MAP.SNX]: SNXIcon,
};
