import KWENTAIcon from 'assets/png/currencies/KWENTA.png';
import AAVEIcon from 'assets/png/currencies/sAAVE.png';
import ADAIcon from 'assets/png/currencies/sADA.png';
import APEIcon from 'assets/png/currencies/sAPECOIN.png';
import APTIcon from 'assets/png/currencies/sAPT.png';
import ARBIcon from 'assets/png/currencies/sARB.png';
import ATOMIcon from 'assets/png/currencies/sATOM.png';
import AUDIcon from 'assets/png/currencies/sAUD.png';
import AVAXIcon from 'assets/png/currencies/sAVAX.png';
import AXSIcon from 'assets/png/currencies/sAXS.png';
import BCHIcon from 'assets/png/currencies/sBCH.png';
import BNBIcon from 'assets/png/currencies/sBNB.png';
import BTCIcon from 'assets/png/currencies/sBTC.png';
import CHFIcon from 'assets/png/currencies/sCHF.png';
import CRVIcon from 'assets/png/currencies/sCRV.png';
import DOGEIcon from 'assets/png/currencies/sDOGE.png';
import DOTIcon from 'assets/png/currencies/sDOT.png';
import DYDXIcon from 'assets/png/currencies/sDYDX.png';
import ETHIcon from 'assets/png/currencies/sETH.png';
import ETHBTCIcon from 'assets/png/currencies/sETHBTC.png';
import EURIcon from 'assets/png/currencies/sEUR.png';
import FILIcon from 'assets/png/currencies/sFIL.png';
import FLOWIcon from 'assets/png/currencies/sFLOW.png';
import FTMIcon from 'assets/png/currencies/sFTM.png';
import GBPIcon from 'assets/png/currencies/sGBP.png';
import GMXIcon from 'assets/png/currencies/sGMX.png';
import INRIcon from 'assets/png/currencies/sINR.png';
import JPYIcon from 'assets/png/currencies/sJPY.png';
import KRWIcon from 'assets/png/currencies/sKRW.png';
import LDOIcon from 'assets/png/currencies/sLDO.png';
import LINKIcon from 'assets/png/currencies/sLINK.png';
import LTCIcon from 'assets/png/currencies/sLTC.png';
import MATICIcon from 'assets/png/currencies/sMATIC.png';
import NEARIcon from 'assets/png/currencies/sNEAR.png';
import SNXIcon from 'assets/png/currencies/SNX.png';
import OILIcon from 'assets/png/currencies/sOIL.png';
import OPIcon from 'assets/png/currencies/sOP.png';
import SHIBIcon from 'assets/png/currencies/sSHIB.png';
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
	sAAVEPERP: AAVEIcon,
	sADAPERP: ADAIcon,
	sAPEPERP: APEIcon,
	sAPTPERP: APTIcon,
	sARBPERP: ARBIcon,
	sATOMPERP: ATOMIcon,
	sAUDPERP: AUDIcon,
	sAVAXPERP: AVAXIcon,
	sAXSPERP: AXSIcon,
	sBCHPERP: BCHIcon,
	sBNBPERP: BNBIcon,
	sBTCPERP: BTCIcon,
	sCRVPERP: CRVIcon,
	sDOGEPERP: DOGEIcon,
	sDYDXPERP: DYDXIcon,
	sETHPERP: ETHIcon,
	sEURPERP: EURIcon,
	sFILPERP: FILIcon,
	sFLOWPERP: FLOWIcon,
	sFTMPERP: FTMIcon,
	sGBPPERP: GBPIcon,
	sGMXPERP: GMXIcon,
	sLINKPERP: LINKIcon,
	sLDOPERP: LDOIcon,
	sLTCPERP: LTCIcon,
	sMATICPERP: MATICIcon,
	sNEARPERP: NEARIcon,
	sOPPERP: OPIcon,
	sSHIBPERP: SHIBIcon,
	sSOLPERP: SOLIcon,
	sUNIPERP: UNIIcon,
	sXAUPERP: XAUIcon,
	sXAGPERP: XAGIcon,
	sXMRPERP: XMRIcon,
	sAAVE: AAVEIcon,
	sADA: ADAIcon,
	sAPE: APEIcon,
	sARB: ARBIcon,
	sAPT: APTIcon,
	sATOM: ATOMIcon,
	sAUD: AUDIcon,
	sAVAX: AVAXIcon,
	sAXS: AXSIcon,
	sBCH: BCHIcon,
	sBNB: BNBIcon,
	sBTC: BTCIcon,
	sCHF: CHFIcon,
	sCRV: CRVIcon,
	sDOGE: DOGEIcon,
	sDOT: DOTIcon,
	sDYDX: DYDXIcon,
	sETH: ETHIcon,
	sETHBTC: ETHBTCIcon,
	sEUR: EURIcon,
	sFIL: FILIcon,
	sFLOW: FLOWIcon,
	sFTM: FTMIcon,
	sGBP: GBPIcon,
	sGMX: GMXIcon,
	sINR: INRIcon,
	sJPY: JPYIcon,
	sKRW: KRWIcon,
	sLDO: LDOIcon,
	sLINK: LINKIcon,
	sLTC: LTCIcon,
	sMATIC: MATICIcon,
	sNEAR: NEARIcon,
	sOP: OPIcon,
	sSHIB: SHIBIcon,
	sSOL: SOLIcon,
	sUNI: UNIIcon,
	sUSD: USDIcon,
	sWTI: OILIcon,
	sXAU: XAUIcon,
	sXAG: XAGIcon,
	sXMR: XMRIcon,
	KWENTA: KWENTAIcon,
	[CRYPTO_CURRENCY_MAP.SNX]: SNXIcon,
	WBTC: WBTCIcon,
};
