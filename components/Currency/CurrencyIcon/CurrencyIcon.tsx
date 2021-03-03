import React, { FC } from 'react';
import Img from 'react-optimized-image';

// Crypto
// import BTCIcon from 'assets/svg/currencies/crypto/BTC.svg';
import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';
// import XRPIcon from 'assets/svg/currencies/crypto/XRP.svg';
// import BCHIcon from 'assets/svg/currencies/crypto/BCH.svg';
// import LTCIcon from 'assets/svg/currencies/crypto/LTC.svg';
// import EOSIcon from 'assets/svg/currencies/crypto/EOS.svg';
// import BNBIcon from 'assets/svg/currencies/crypto/BNB.svg';
// import XTZIcon from 'assets/svg/currencies/crypto/XTZ.svg';
// import XMRIcon from 'assets/svg/currencies/crypto/XMR.svg';
// import ADAIcon from 'assets/svg/currencies/crypto/ADA.svg';
// import LINKIcon from 'assets/svg/currencies/crypto/LINK.svg';
// import TRXIcon from 'assets/svg/currencies/crypto/TRX.svg';
// import DASHIcon from 'assets/svg/currencies/crypto/DASH.svg';
// import ETCIcon from 'assets/svg/currencies/crypto/ETC.svg';
// import SNXIcon from '@synthetixio/assets/snx/SNX.svg';
// import COMPIcon from 'assets/svg/currencies/crypto/COMP.svg';
// import RENIcon from 'assets/svg/currencies/crypto/REN.svg';
// import LENDIcon from 'assets/svg/currencies/crypto/LEND.svg';
// import KNCIcon from 'assets/svg/currencies/crypto/KNC.svg';
// Commodity
// import GOLDIcon from 'assets/svg/currencies/commodity/GOLD.svg';
// import SILVERIcon from 'assets/svg/currencies/commodity/SILVER.svg';
// Equities
// import FTSEIcon from 'assets/svg/currencies/equities/FTSE.svg';
// import NIKKEIIcon from 'assets/svg/currencies/equities/NIKKEI.svg';
// Fiat
// import AUDIcon from 'assets/svg/currencies/fiat/AUD.svg';
// import CADIcon  from 'assets/svg/currencies/fiat/CAD.svg';
// import CHFIcon from 'assets/svg/currencies/fiat/CHF.svg';
// import EURIcon from 'assets/svg/currencies/fiat/EUR.svg';
// import GBPIcon from 'assets/svg/currencies/fiat/GBP.svg';
// import JPYIcon from 'assets/svg/currencies/fiat/JPY.svg';
// import KRWIcon  from 'assets/svg/currencies/fiat/KRW.svg';
// import USDIcon from 'assets/svg/currencies/fiat/USD.svg';
// Indices
// import CEXIcon from 'assets/svg/currencies/indices/CEX.svg';
// import DEFIIcon from 'assets/svg/currencies/indices/DEFI.svg';

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
import sAAVEIcon from '@synthetixio/assets/synths/sAAVE.svg';
import sUNIIcon from '@synthetixio/assets/synths/sUNI.svg';
import sYFIIcon from '@synthetixio/assets/synths/sYFI.svg';
import sDOTIcon from '@synthetixio/assets/synths/sDOT.svg';
import sRENIcon from '@synthetixio/assets/synths/sREN.svg';
import sCOMPIcon from '@synthetixio/assets/synths/sCOMP.svg';

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
import iAAVEIcon from '@synthetixio/assets/synths/iAAVE.svg';
import iUNIIcon from '@synthetixio/assets/synths/iUNI.svg';
import iYFIIcon from '@synthetixio/assets/synths/iYFI.svg';
import iDOTIcon from '@synthetixio/assets/synths/iDOT.svg';
import iRENIcon from '@synthetixio/assets/synths/iREN.svg';
import iCOMPIcon from '@synthetixio/assets/synths/iCOMP.svg';

// Commoditiy Synths
import sXAUIcon from '@synthetixio/assets/synths/sXAU.svg';
import sXAGIcon from '@synthetixio/assets/synths/sXAG.svg';
import sOILIcon from '@synthetixio/assets/synths/sOIL.svg';
import iOILIcon from '@synthetixio/assets/synths/iOIL.svg';
// Crypto Index Synths
import sDEFIIcon from '@synthetixio/assets/synths/sDEFI.svg';
import sCEXIcon from '@synthetixio/assets/synths/sCEX.svg';
import iDEFIIcon from '@synthetixio/assets/synths/iDEFI.svg';
import iCEXIcon from '@synthetixio/assets/synths/iCEX.svg';
// Equity Synths
import sFTSEIcon from '@synthetixio/assets/synths/sFTSE.svg';
import sNIKKEIIcon from '@synthetixio/assets/synths/sNIKKEI.svg';
import sTSLAIcon from '@synthetixio/assets/synths/sTSLA.svg';
// Forex Synths
import sEURIcon from '@synthetixio/assets/synths/sEUR.svg';
import sJPYIcon from '@synthetixio/assets/synths/sJPY.svg';
import sUSDIcon from '@synthetixio/assets/synths/sUSD.svg';
import sAUDIcon from '@synthetixio/assets/synths/sAUD.svg';
import sGBPIcon from '@synthetixio/assets/synths/sGBP.svg';
import sCHFIcon from '@synthetixio/assets/synths/sCHF.svg';
import sKRWIcon from '@synthetixio/assets/synths/sKRW.svg';

import { CRYPTO_CURRENCY_MAP, CurrencyKey, SYNTHS_MAP } from 'constants/currency';

type CurrencyIconProps = {
	currencyKey: CurrencyKey;
	type?: 'synth' | 'asset';
	className?: string;
	width?: string;
	height?: string;
};

export const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, type = 'synth', ...rest }) => {
	const props = {
		width: '24px',
		height: '24px',
		alt: currencyKey,
		...rest,
	};

	// TODO: next-optimized-images does not support dynamic imports yet... so it needs to be manually defined.

	// most of the "asset" types were disabled since they were not widely used.
	switch (currencyKey) {
		case CRYPTO_CURRENCY_MAP.ETH: {
			return <Img src={ETHIcon} {...props} />;
		}

		case SYNTHS_MAP.sBTC: {
			return <Img src={sBTCIcon} {...props} />;
		}
		case SYNTHS_MAP.sETH: {
			return type === 'synth' ? (
				<Img src={sETHIcon} {...props} />
			) : (
				<Img src={ETHIcon} {...props} />
			);
		}
		case SYNTHS_MAP.sXRP: {
			return <Img src={sXRPIcon} {...props} />;
		}
		case SYNTHS_MAP.sBCH: {
			return <Img src={sBCHIcon} {...props} />;
		}
		case SYNTHS_MAP.sLTC: {
			return <Img src={sLTCIcon} {...props} />;
		}
		case SYNTHS_MAP.sEOS: {
			return <Img src={sEOSIcon} {...props} />;
		}
		case SYNTHS_MAP.sBNB: {
			return <Img src={sBNBIcon} {...props} />;
		}
		case SYNTHS_MAP.sXTZ: {
			return <Img src={sXTZIcon} {...props} />;
		}
		case SYNTHS_MAP.sXMR: {
			return <Img src={sXMRIcon} {...props} />;
		}
		case SYNTHS_MAP.sADA: {
			return <Img src={sADAIcon} {...props} />;
		}
		case SYNTHS_MAP.sLINK: {
			return <Img src={sLINKIcon} {...props} />;
		}
		case SYNTHS_MAP.sTRX: {
			return <Img src={sTRXIcon} {...props} />;
		}
		case SYNTHS_MAP.sDASH: {
			return <Img src={sDASHIcon} {...props} />;
		}
		case SYNTHS_MAP.sAAVE: {
			return <Img src={sAAVEIcon} {...props} />;
		}
		case SYNTHS_MAP.sUNI: {
			return <Img src={sUNIIcon} {...props} />;
		}
		case SYNTHS_MAP.sYFI: {
			return <Img src={sYFIIcon} {...props} />;
		}
		case SYNTHS_MAP.sDOT: {
			return <Img src={sDOTIcon} {...props} />;
		}
		case SYNTHS_MAP.sREN: {
			return <Img src={sRENIcon} {...props} />;
		}
		case SYNTHS_MAP.sCOMP: {
			return <Img src={sCOMPIcon} {...props} />;
		}
		case SYNTHS_MAP.sETC: {
			return <Img src={sETCIcon} {...props} />;
		}
		case SYNTHS_MAP.iBTC: {
			return <Img src={iBTCIcon} {...props} />;
		}
		case SYNTHS_MAP.iETH: {
			return <Img src={iETHIcon} {...props} />;
		}
		case SYNTHS_MAP.iXRP: {
			return <Img src={iXRPIcon} {...props} />;
		}
		case SYNTHS_MAP.iBCH: {
			return <Img src={iBCHIcon} {...props} />;
		}
		case SYNTHS_MAP.iLTC: {
			return <Img src={iLTCIcon} {...props} />;
		}
		case SYNTHS_MAP.iEOS: {
			return <Img src={iEOSIcon} {...props} />;
		}
		case SYNTHS_MAP.iBNB: {
			return <Img src={iBNBIcon} {...props} />;
		}
		case SYNTHS_MAP.iXTZ: {
			return <Img src={iXTZIcon} {...props} />;
		}
		case SYNTHS_MAP.iXMR: {
			return <Img src={iXMRIcon} {...props} />;
		}
		case SYNTHS_MAP.iADA: {
			return <Img src={iADAIcon} {...props} />;
		}
		case SYNTHS_MAP.iLINK: {
			return <Img src={iLINKIcon} {...props} />;
		}
		case SYNTHS_MAP.iTRX: {
			return <Img src={iTRXIcon} {...props} />;
		}
		case SYNTHS_MAP.iDASH: {
			return <Img src={iDASHIcon} {...props} />;
		}
		case SYNTHS_MAP.iETC: {
			return <Img src={iETCIcon} {...props} />;
		}
		case SYNTHS_MAP.sEUR: {
			return <Img src={sEURIcon} {...props} />;
		}
		case SYNTHS_MAP.sJPY: {
			return <Img src={sJPYIcon} {...props} />;
		}
		case SYNTHS_MAP.sUSD: {
			return <Img src={sUSDIcon} {...props} />;
		}
		case SYNTHS_MAP.sAUD: {
			return <Img src={sAUDIcon} {...props} />;
		}
		case SYNTHS_MAP.sGBP: {
			return <Img src={sGBPIcon} {...props} />;
		}
		case SYNTHS_MAP.sCHF: {
			return <Img src={sCHFIcon} {...props} />;
		}
		case SYNTHS_MAP.sKRW: {
			return <Img src={sKRWIcon} {...props} />;
		}
		case SYNTHS_MAP.sXAU: {
			return <Img src={sXAUIcon} {...props} />;
		}
		case SYNTHS_MAP.sXAG: {
			return <Img src={sXAGIcon} {...props} />;
		}
		case SYNTHS_MAP.sCEX: {
			return <Img src={sCEXIcon} {...props} />;
		}
		case SYNTHS_MAP.sDEFI: {
			return <Img src={sDEFIIcon} {...props} />;
		}
		case SYNTHS_MAP.iCEX: {
			return <Img src={iCEXIcon} {...props} />;
		}
		case SYNTHS_MAP.iDEFI: {
			return <Img src={iDEFIIcon} {...props} />;
		}
		case SYNTHS_MAP.sFTSE: {
			return <Img src={sFTSEIcon} {...props} />;
		}
		case SYNTHS_MAP.sNIKKEI: {
			return <Img src={sNIKKEIIcon} {...props} />;
		}
		case SYNTHS_MAP.sTSLA: {
			return <Img src={sTSLAIcon} {...props} />;
		}
		case SYNTHS_MAP.sOIL: {
			return <Img src={sOILIcon} {...props} />;
		}
		case SYNTHS_MAP.iOIL: {
			return <Img src={iOILIcon} {...props} />;
		}
		case SYNTHS_MAP.iAAVE: {
			return <Img src={iAAVEIcon} {...props} />;
		}
		case SYNTHS_MAP.iUNI: {
			return <Img src={iUNIIcon} {...props} />;
		}
		case SYNTHS_MAP.iYFI: {
			return <Img src={iYFIIcon} {...props} />;
		}
		case SYNTHS_MAP.iDOT: {
			return <Img src={iDOTIcon} {...props} />;
		}
		case SYNTHS_MAP.iREN: {
			return <Img src={iRENIcon} {...props} />;
		}
		case SYNTHS_MAP.iCOMP: {
			return <Img src={iCOMPIcon} {...props} />;
		}
		default:
			return null;
	}
};

export default CurrencyIcon;
