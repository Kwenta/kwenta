import KWENTAIcon from 'assets/png/currencies/KWENTA.png';
import AAVEIcon from 'assets/png/currencies/sAAVE.png';
import ADAIcon from 'assets/png/currencies/sADA.png';
import APEIcon from 'assets/png/currencies/sAPECOIN.png';
import ATOMIcon from 'assets/png/currencies/sATOM.png';
import AUDIcon from 'assets/png/currencies/sAUD.png';
import AVAXIcon from 'assets/png/currencies/sAVAX.png';
import AXSIcon from 'assets/png/currencies/sAXS.png';
import BNBIcon from 'assets/png/currencies/sBNB.png';
import BTCIcon from 'assets/png/currencies/sBTC.png';
import CHFIcon from 'assets/png/currencies/sCHF.png';
import DOGEIcon from 'assets/png/currencies/sDOGE.png';
import DOTIcon from 'assets/png/currencies/sDOT.png';
import DYDXIcon from 'assets/png/currencies/sDYDX.png';
import ETHIcon from 'assets/png/currencies/sETH.png';
import ETHBTCIcon from 'assets/png/currencies/sETHBTC.png';
import EURIcon from 'assets/png/currencies/sEUR.png';
import FLOWIcon from 'assets/png/currencies/sFLOW.png';
import FTMIcon from 'assets/png/currencies/sFTM.png';
import GBPIcon from 'assets/png/currencies/sGBP.png';
import INRIcon from 'assets/png/currencies/sINR.png';
import JPYIcon from 'assets/png/currencies/sJPY.png';
import KRWIcon from 'assets/png/currencies/sKRW.png';
import LINKIcon from 'assets/png/currencies/sLINK.png';
import MATICIcon from 'assets/png/currencies/sMATIC.png';
import NEARIcon from 'assets/png/currencies/sNEAR.png';
import SNXIcon from 'assets/png/currencies/SNX.png';
import OILIcon from 'assets/png/currencies/sOIL.png';
import OPIcon from 'assets/png/currencies/sOP.png';
import SOLIcon from 'assets/png/currencies/sSOL.png';
import UNIIcon from 'assets/png/currencies/sUNI.png';
import USDIcon from 'assets/png/currencies/sUSD.png';
import XAGIcon from 'assets/png/currencies/sXAG.png';
import XAUIcon from 'assets/png/currencies/sXAU.png';
import XMRIcon from 'assets/png/currencies/sXMR.png';
import WBTCIcon from 'assets/png/currencies/WBTC.png';
import { CRYPTO_CURRENCY_MAP, SynthsName } from 'constants/currency';
import { FuturesMarketKey } from 'sdk/types/futures';

export const SYNTH_ICONS: Record<FuturesMarketKey | SynthsName | string, any> = {
	sETHPERP: ETHIcon,
	sBTCPERP: BTCIcon,
	sLINKPERP: LINKIcon,
	sSOLPERP: SOLIcon,
	sAVAXPERP: AVAXIcon,
	sAAVEPERP: AAVEIcon,
	sUNIPERP: UNIIcon,
	sMATICPERP: MATICIcon,
	sXAUPERP: XAUIcon,
	sXAGPERP: XAGIcon,
	sEURPERP: EURIcon,
	sAPEPERP: APEIcon,
	sDYDXPERP: DYDXIcon,
	sBNBPERP: BNBIcon,
	sDOGEPERP: DOGEIcon,
	sXMRPERP: XMRIcon,
	sOPPERP: OPIcon,
	sATOMPERP: ATOMIcon,
	sFTMPERP: FTMIcon,
	sNEARPERP: NEARIcon,
	sFLOWPERP: FLOWIcon,
	sAXSPERP: AXSIcon,
	sAUDPERP: AUDIcon,
	sGBPPERP: GBPIcon,
	sWTI: OILIcon,
	sUSD: USDIcon,
	sINR: INRIcon,
	sJPY: JPYIcon,
	sGBP: GBPIcon,
	sCHF: CHFIcon,
	sKRW: KRWIcon,
	sDOT: DOTIcon,
	sETHBTC: ETHBTCIcon,
	sADA: ADAIcon,
	KWENTA: KWENTAIcon,
	[CRYPTO_CURRENCY_MAP.SNX]: SNXIcon,
	WBTC: WBTCIcon,
};
