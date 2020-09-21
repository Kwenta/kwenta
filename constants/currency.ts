import keyBy from 'lodash/keyBy';

import { HistoricalTrade } from 'queries/trades/types';

// Crypto
import BTCIcon from 'assets/svg/currencies/crypto/BTC.svg';
import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';
import XRPIcon from 'assets/svg/currencies/crypto/XRP.svg';
import BCHIcon from 'assets/svg/currencies/crypto/BCH.svg';
import LTCIcon from 'assets/svg/currencies/crypto/LTC.svg';
import EOSIcon from 'assets/svg/currencies/crypto/EOS.svg';
import BNBIcon from 'assets/svg/currencies/crypto/BNB.svg';
import XTZIcon from 'assets/svg/currencies/crypto/XTZ.svg';
import XMRIcon from 'assets/svg/currencies/crypto/XMR.svg';
import ADAIcon from 'assets/svg/currencies/crypto/ADA.svg';
import LINKIcon from 'assets/svg/currencies/crypto/LINK.svg';
import TRXIcon from 'assets/svg/currencies/crypto/TRX.svg';
import DASHIcon from 'assets/svg/currencies/crypto/DASH.svg';
import ETCIcon from 'assets/svg/currencies/crypto/ETC.svg';
import SNXIcon from '@synthetixio/assets/snx/SNX.svg';
import COMPIcon from 'assets/svg/currencies/crypto/COMP.svg';
import RENIcon from 'assets/svg/currencies/crypto/REN.svg';
import LENDIcon from 'assets/svg/currencies/crypto/LEND.svg';
import KNCIcon from 'assets/svg/currencies/crypto/KNC.svg';
// Commodity
import GOLDIcon from 'assets/svg/currencies/commodity/GOLD.svg';
import SILVERIcon from 'assets/svg/currencies/commodity/SILVER.svg';
// Equities
import FTSEIcon from 'assets/svg/currencies/equities/FTSE.svg';
import NIKKEIIcon from 'assets/svg/currencies/equities/NIKKEI.svg';
// Fiat
import AUDIcon from 'assets/svg/currencies/fiat/AUD.svg';
// import CADIcon  from 'assets/svg/currencies/fiat/CAD.svg';
import CHFIcon from 'assets/svg/currencies/fiat/CHF.svg';
import EURIcon from 'assets/svg/currencies/fiat/EUR.svg';
import GBPIcon from 'assets/svg/currencies/fiat/GBP.svg';
import JPYIcon from 'assets/svg/currencies/fiat/JPY.svg';
// import KRWIcon  from 'assets/svg/currencies/fiat/KRW.svg';
import USDIcon from 'assets/svg/currencies/fiat/USD.svg';
// Indices
import CEXIcon from 'assets/svg/currencies/indices/CEX.svg';
import DEFIIcon from 'assets/svg/currencies/indices/DEFI.svg';

// Crypto Synths
import sBTCIcon from '@synthetixio/assets/synths/sBTC.svg';
import sETHIcon from '@synthetixio/assets/synths/sETH.svg';
import sXRPIcon from '@synthetixio/assets/synths/sXRP.svg';
import sBCHIcon from '@synthetixio/assets/synths/sBCH.svg';
import sLTCIcon from '@synthetixio/assets/synths/sLTC.svg';
import sEOSIcon from '@synthetixio/assets/synths/sEOS.svg';
import sBNBIcon from '@synthetixio/assets/synths/sBNB.svg';
import sXTZIcon from '@synthetixio/assets/synths/sXTZ.svg';
import sXMRIcon from '@synthetixio/assets/synths/sXMR.svg';
import sADAIcon from '@synthetixio/assets/synths/sADA.svg';
import sLINKIcon from '@synthetixio/assets/synths/sLINK.svg';
import sTRXIcon from '@synthetixio/assets/synths/sTRX.svg';
import sDASHIcon from '@synthetixio/assets/synths/sDASH.svg';
import sETCIcon from '@synthetixio/assets/synths/sETC.svg';
import iBTCIcon from '@synthetixio/assets/synths/iBTC.svg';
import iETHIcon from '@synthetixio/assets/synths/iETH.svg';
import iXRPIcon from '@synthetixio/assets/synths/iXRP.svg';
import iBCHIcon from '@synthetixio/assets/synths/iBCH.svg';
import iLTCIcon from '@synthetixio/assets/synths/iLTC.svg';
import iEOSIcon from '@synthetixio/assets/synths/iEOS.svg';
import iBNBIcon from '@synthetixio/assets/synths/iBNB.svg';
import iXTZIcon from '@synthetixio/assets/synths/iXTZ.svg';
import iXMRIcon from '@synthetixio/assets/synths/iXMR.svg';
import iADAIcon from '@synthetixio/assets/synths/iADA.svg';
import iLINKIcon from '@synthetixio/assets/synths/iLINK.svg';
import iTRXIcon from '@synthetixio/assets/synths/iTRX.svg';
import iDASHIcon from '@synthetixio/assets/synths/iDASH.svg';
import iETCIcon from '@synthetixio/assets/synths/iETC.svg';
// Commoditiy Synths
import sXAUIcon from '@synthetixio/assets/synths/sXAU.svg';
import sXAGIcon from '@synthetixio/assets/synths/sXAG.svg';
// import sOILIcon from '@synthetixio/assets/synths/sOIL.svg';
// Crypto Index Synths
import sDEFIIcon from '@synthetixio/assets/synths/sDEFI.svg';
import sCEXIcon from '@synthetixio/assets/synths/sCEX.svg';
import iDEFIIcon from '@synthetixio/assets/synths/iDEFI.svg';
import iCEXIcon from '@synthetixio/assets/synths/iCEX.svg';
// Equity Synths
import sFTSEIcon from '@synthetixio/assets/synths/sFTSE.svg';
import sNIKKEIIcon from '@synthetixio/assets/synths/sNIKKEI.svg';
// Forex Synths
import sEURIcon from '@synthetixio/assets/synths/sEUR.svg';
import sJPYIcon from '@synthetixio/assets/synths/sJPY.svg';
import sUSDIcon from '@synthetixio/assets/synths/sUSD.svg';
import sAUDIcon from '@synthetixio/assets/synths/sAUD.svg';
import sGBPIcon from '@synthetixio/assets/synths/sGBP.svg';
import sCHFIcon from '@synthetixio/assets/synths/sCHF.svg';

export type CurrencyKey = string;

// TODO: standardize this
export type Category = 'crypto' | 'forex' | 'equities' | 'index' | 'commodity' | 'inverse';

export const CATEGORY: Category[] = [
	'crypto',
	'forex',
	'equities',
	'index',
	'commodity',
	'inverse',
];
export const CATEGORY_MAP = keyBy(CATEGORY);

export const SYNTHS = [
	'sBTC',
	'sETH',
	'sXRP',
	'sBCH',
	'sLTC',
	'sEOS',
	'sBNB',
	'sXTZ',
	'sXMR',
	'sADA',
	'sLINK',
	'sTRX',
	'sDASH',
	'sETC',
	'iBTC',
	'iETH',
	'iXRP',
	'iBCH',
	'iLTC',
	'iEOS',
	'iBNB',
	'iXTZ',
	'iXMR',
	'iADA',
	'iLINK',
	'iTRX',
	'iDASH',
	'iETC',
	'sFTSE',
	'sNIKKEI',
	'sXAU',
	'sXAG',
	// 'sOIL',
	'sEUR',
	'sJPY',
	'sUSD',
	'sAUD',
	'sGBP',
	'sCHF',
	'sCEX',
	'sDEFI',
	'iCEX',
	'iDEFI',
];

export const SYNTHS_MAP = keyBy(SYNTHS);

export const CRYPTO_CURRENCY = [
	'KNC',
	'COMP',
	'REN',
	'LEND',
	'SNX',
	'BTC',
	'ETH',
	'XRP',
	'BCH',
	'LTC',
	'EOS',
	'BNB',
	'XTZ',
	'XMR',
	'ADA',
	'LINK',
	'TRX',
	'DASH',
	'ETC',
];

export const CRYPTO_CURRENCY_MAP = keyBy(CRYPTO_CURRENCY);

export const CURRENCY_KEY_TO_ICON_MAP = {
	[CRYPTO_CURRENCY_MAP.ETH]: { AssetIcon: ETHIcon },
	[CRYPTO_CURRENCY_MAP.SNX]: { AssetIcon: SNXIcon },
	[CRYPTO_CURRENCY_MAP.KNC]: { AssetIcon: KNCIcon },
	[CRYPTO_CURRENCY_MAP.LEND]: { AssetIcon: LENDIcon },
	[CRYPTO_CURRENCY_MAP.REN]: { AssetIcon: RENIcon },
	[CRYPTO_CURRENCY_MAP.COMP]: { AssetIcon: COMPIcon },

	[SYNTHS_MAP.sBTC]: { SynthIcon: sBTCIcon, AssetIcon: BTCIcon },
	[SYNTHS_MAP.sETH]: { SynthIcon: sETHIcon, AssetIcon: ETHIcon },
	[SYNTHS_MAP.sXRP]: { SynthIcon: sXRPIcon, AssetIcon: XRPIcon },
	[SYNTHS_MAP.sBCH]: { SynthIcon: sBCHIcon, AssetIcon: BCHIcon },
	[SYNTHS_MAP.sLTC]: { SynthIcon: sLTCIcon, AssetIcon: LTCIcon },
	[SYNTHS_MAP.sEOS]: { SynthIcon: sEOSIcon, AssetIcon: EOSIcon },
	[SYNTHS_MAP.sBNB]: { SynthIcon: sBNBIcon, AssetIcon: BNBIcon },
	[SYNTHS_MAP.sXTZ]: { SynthIcon: sXTZIcon, AssetIcon: XTZIcon },
	[SYNTHS_MAP.sXMR]: { SynthIcon: sXMRIcon, AssetIcon: XMRIcon },
	[SYNTHS_MAP.sADA]: { SynthIcon: sADAIcon, AssetIcon: ADAIcon },
	[SYNTHS_MAP.sLINK]: { SynthIcon: sLINKIcon, AssetIcon: LINKIcon },
	[SYNTHS_MAP.sTRX]: { SynthIcon: sTRXIcon, AssetIcon: TRXIcon },
	[SYNTHS_MAP.sDASH]: { SynthIcon: sDASHIcon, AssetIcon: DASHIcon },
	[SYNTHS_MAP.sETC]: { SynthIcon: sETCIcon, AssetIcon: ETCIcon },
	[SYNTHS_MAP.iBTC]: { SynthIcon: iBTCIcon, AssetIcon: BTCIcon },
	[SYNTHS_MAP.iETH]: { SynthIcon: iETHIcon, AssetIcon: ETHIcon },
	[SYNTHS_MAP.iXRP]: { SynthIcon: iXRPIcon, AssetIcon: XRPIcon },
	[SYNTHS_MAP.iBCH]: { SynthIcon: iBCHIcon, AssetIcon: BCHIcon },
	[SYNTHS_MAP.iLTC]: { SynthIcon: iLTCIcon, AssetIcon: LTCIcon },
	[SYNTHS_MAP.iEOS]: { SynthIcon: iEOSIcon, AssetIcon: EOSIcon },
	[SYNTHS_MAP.iBNB]: { SynthIcon: iBNBIcon, AssetIcon: BNBIcon },
	[SYNTHS_MAP.iXTZ]: { SynthIcon: iXTZIcon, AssetIcon: XTZIcon },
	[SYNTHS_MAP.iXMR]: { SynthIcon: iXMRIcon, AssetIcon: XMRIcon },
	[SYNTHS_MAP.iADA]: { SynthIcon: iADAIcon, AssetIcon: ADAIcon },
	[SYNTHS_MAP.iLINK]: { SynthIcon: iLINKIcon, AssetIcon: LINKIcon },
	[SYNTHS_MAP.iTRX]: { SynthIcon: iTRXIcon, AssetIcon: TRXIcon },
	[SYNTHS_MAP.iDASH]: { SynthIcon: iDASHIcon, AssetIcon: DASHIcon },
	[SYNTHS_MAP.iETC]: { SynthIcon: iETCIcon, AssetIcon: ETCIcon },
	[SYNTHS_MAP.sEUR]: { SynthIcon: sEURIcon, AssetIcon: EURIcon },
	[SYNTHS_MAP.sJPY]: { SynthIcon: sJPYIcon, AssetIcon: JPYIcon },
	[SYNTHS_MAP.sUSD]: { SynthIcon: sUSDIcon, AssetIcon: USDIcon },
	[SYNTHS_MAP.sAUD]: { SynthIcon: sAUDIcon, AssetIcon: AUDIcon },
	[SYNTHS_MAP.sGBP]: { SynthIcon: sGBPIcon, AssetIcon: GBPIcon },
	[SYNTHS_MAP.sCHF]: { SynthIcon: sCHFIcon, AssetIcon: CHFIcon },
	[SYNTHS_MAP.sXAU]: { SynthIcon: sXAUIcon, AssetIcon: GOLDIcon },
	[SYNTHS_MAP.sXAG]: { SynthIcon: sXAGIcon, AssetIcon: SILVERIcon },
	// [SYNTHS_MAP.sOIL]: { SynthIcon: sOILIcon, AssetIcon: sOILIcon },
	[SYNTHS_MAP.sCEX]: { SynthIcon: sCEXIcon, AssetIcon: CEXIcon },
	[SYNTHS_MAP.sDEFI]: { SynthIcon: sDEFIIcon, AssetIcon: DEFIIcon },
	[SYNTHS_MAP.iCEX]: { SynthIcon: iCEXIcon, AssetIcon: CEXIcon },
	[SYNTHS_MAP.iDEFI]: { SynthIcon: iDEFIIcon, AssetIcon: DEFIIcon },
	[SYNTHS_MAP.sFTSE]: { SynthIcon: sFTSEIcon, AssetIcon: FTSEIcon },
	[SYNTHS_MAP.sNIKKEI]: { SynthIcon: sNIKKEIIcon, AssetIcon: NIKKEIIcon },
};

export const FIAT_SYNTHS = new Set([
	SYNTHS_MAP.sEUR,
	SYNTHS_MAP.sJPY,
	SYNTHS_MAP.sUSD,
	SYNTHS_MAP.sAUD,
	SYNTHS_MAP.sGBP,
	SYNTHS_MAP.sCHF,
]);

export const sUSD_EXCHANGE_RATE = 1;
