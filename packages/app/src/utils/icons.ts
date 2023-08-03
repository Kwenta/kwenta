import { CRYPTO_CURRENCY_MAP } from '@kwenta/sdk/constants'
import { FuturesMarketKey } from '@kwenta/sdk/types'

import KWENTAIcon from 'assets/png/currencies/KWENTA.png'
import AAVEIcon from 'assets/png/currencies/sAAVE.png'
import ADAIcon from 'assets/png/currencies/sADA.png'
import APEIcon from 'assets/png/currencies/sAPECOIN.png'
import APTIcon from 'assets/png/currencies/sAPT.png'
import ARBIcon from 'assets/png/currencies/sARB.png'
import ATOMIcon from 'assets/png/currencies/sATOM.png'
import AUDIcon from 'assets/png/currencies/sAUD.png'
import AVAXIcon from 'assets/png/currencies/sAVAX.png'
import AXSIcon from 'assets/png/currencies/sAXS.png'
import BCHIcon from 'assets/png/currencies/sBCH.png'
import BLURIcon from 'assets/png/currencies/sBLUR.png'
import BNBIcon from 'assets/png/currencies/sBNB.png'
import BTCIcon from 'assets/png/currencies/sBTC.png'
import CHFIcon from 'assets/png/currencies/sCHF.png'
import COMPIcon from 'assets/png/currencies/sCOMP.png'
import CRVIcon from 'assets/png/currencies/sCRV.png'
import DOGEIcon from 'assets/png/currencies/sDOGE.png'
import DOTIcon from 'assets/png/currencies/sDOT.png'
import DYDXIcon from 'assets/png/currencies/sDYDX.png'
import ETCIcon from 'assets/png/currencies/sETC.png'
import ETHIcon from 'assets/png/currencies/sETH.png'
import ETHBTCIcon from 'assets/png/currencies/sETHBTC.png'
import EURIcon from 'assets/png/currencies/sEUR.png'
import FILIcon from 'assets/png/currencies/sFIL.png'
import FLOKIIcon from 'assets/png/currencies/sFLOKI.png'
import FLOWIcon from 'assets/png/currencies/sFLOW.png'
import FTMIcon from 'assets/png/currencies/sFTM.png'
import GBPIcon from 'assets/png/currencies/sGBP.png'
import GMXIcon from 'assets/png/currencies/sGMX.png'
import INJIcon from 'assets/png/currencies/sINJ.png'
import INRIcon from 'assets/png/currencies/sINR.png'
import JPYIcon from 'assets/png/currencies/sJPY.png'
import KRWIcon from 'assets/png/currencies/sKRW.png'
import LDOIcon from 'assets/png/currencies/sLDO.png'
import LINKIcon from 'assets/png/currencies/sLINK.png'
import LTCIcon from 'assets/png/currencies/sLTC.png'
import MATICIcon from 'assets/png/currencies/sMATIC.png'
import MAVIcon from 'assets/png/currencies/sMAV.png'
import MKRIcon from 'assets/png/currencies/sMKR.png'
import NEARIcon from 'assets/png/currencies/sNEAR.png'
import SNXIcon from 'assets/png/currencies/SNX.png'
import OILIcon from 'assets/png/currencies/sOIL.png'
import OPIcon from 'assets/png/currencies/sOP.png'
import PEPEIcon from 'assets/png/currencies/sPEPE.png'
import RPLIcon from 'assets/png/currencies/sRPL.png'
import SHIBIcon from 'assets/png/currencies/sSHIB.png'
import SOLIcon from 'assets/png/currencies/sSOL.png'
import STETHIcon from 'assets/png/currencies/sstETH.png'
import SUIIcon from 'assets/png/currencies/sSUI.png'
import TRXIcon from 'assets/png/currencies/sTRX.png'
import UNIIcon from 'assets/png/currencies/sUNI.png'
import USDIcon from 'assets/png/currencies/sUSD.png'
import WLDIcon from 'assets/png/currencies/sWLD.png'
import XAGIcon from 'assets/png/currencies/sXAG.png'
import XAUIcon from 'assets/png/currencies/sXAU.png'
import XMRIcon from 'assets/png/currencies/sXMR.png'
import XRPIcon from 'assets/png/currencies/sXRP.png'
import YFIIcon from 'assets/png/currencies/sYFI.png'
import WBTCIcon from 'assets/png/currencies/WBTC.png'
import { SynthsName } from 'constants/currency'

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
	sBLURPERP: BLURIcon,
	sBNBPERP: BNBIcon,
	sBTCPERP: BTCIcon,
	sCOMPPERP: COMPIcon,
	sCRVPERP: CRVIcon,
	sDOGEPERP: DOGEIcon,
	sDOTPERP: DOTIcon,
	sDYDXPERP: DYDXIcon,
	sETHPERP: ETHIcon,
	sETHBTCPERP: ETHBTCIcon,
	sETCPERP: ETCIcon,
	sEURPERP: EURIcon,
	sFILPERP: FILIcon,
	sFLOKIPERP: FLOKIIcon,
	sFLOWPERP: FLOWIcon,
	sFTMPERP: FTMIcon,
	sGBPPERP: GBPIcon,
	sGMXPERP: GMXIcon,
	sINJPERP: INJIcon,
	sLINKPERP: LINKIcon,
	sLDOPERP: LDOIcon,
	sLTCPERP: LTCIcon,
	sMATICPERP: MATICIcon,
	sMAVPERP: MAVIcon,
	sMKRPERP: MKRIcon,
	sNEARPERP: NEARIcon,
	sOPPERP: OPIcon,
	sPEPEPERP: PEPEIcon,
	sRPLPERP: RPLIcon,
	sSHIBPERP: SHIBIcon,
	sSOLPERP: SOLIcon,
	sSTETHPERP: STETHIcon,
	sSUIPERP: SUIIcon,
	sTRXPERP: TRXIcon,
	sUNIPERP: UNIIcon,
	sWLDPERP: WLDIcon,
	sXAUPERP: XAUIcon,
	sXAGPERP: XAGIcon,
	sXMRPERP: XMRIcon,
	sXRPPERP: XRPIcon,
	sYFIPERP: YFIIcon,
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
	sBLUR: BLURIcon,
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
	sFLOKI: FLOKIIcon,
	sFLOW: FLOWIcon,
	sFTM: FTMIcon,
	sGBP: GBPIcon,
	sGMX: GMXIcon,
	sINJ: INJIcon,
	sINR: INRIcon,
	sJPY: JPYIcon,
	sKRW: KRWIcon,
	sLDO: LDOIcon,
	sLINK: LINKIcon,
	sLTC: LTCIcon,
	sMATIC: MATICIcon,
	sNEAR: NEARIcon,
	sOP: OPIcon,
	sPEPE: PEPEIcon,
	sSHIB: SHIBIcon,
	sSOL: SOLIcon,
	sSTETH: STETHIcon,
	sSUI: SUIIcon,
	sTRX: TRXIcon,
	sUNI: UNIIcon,
	sUSD: USDIcon,
	sWTI: OILIcon,
	sXAU: XAUIcon,
	sXAG: XAGIcon,
	sXMR: XMRIcon,
	sXRP: XRPIcon,
	KWENTA: KWENTAIcon,
	[CRYPTO_CURRENCY_MAP.SNX]: SNXIcon,
	WBTC: WBTCIcon,
}
