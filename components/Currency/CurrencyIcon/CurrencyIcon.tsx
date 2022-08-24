import Image from 'next/image';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import AAVEIcon from 'assets/png/currencies/sAAVE.png';
import ADAIcon from 'assets/png/currencies/sADA.png';
import APEIcon from 'assets/png/currencies/sAPECOIN.png';
import AUDIcon from 'assets/png/currencies/sAUD.png';
import AVAXIcon from 'assets/png/currencies/sAVAX.png';
import BTCIcon from 'assets/png/currencies/sBTC.png';
import CHFIcon from 'assets/png/currencies/sCHF.png';
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
import DeprecatedXIcon from 'assets/svg/app/deprecated-x.svg';
import { CRYPTO_CURRENCY_MAP, CurrencyKey, SynthsName } from 'constants/currency';
import useOneInchTokenList from 'queries/tokenLists/useOneInchTokenList';
import { FlexDivCentered } from 'styles/common';
import { FuturesMarketKey } from 'utils/futures';

export type CurrencyIconProps = {
	currencyKey: string;
	type?: 'synth' | 'asset' | 'token';
	className?: string;
	width?: string;
	height?: string;
	isDeprecated?: boolean;
	style?: any;
	url?: string;
};

export const getSynthIcon = (currencyKey: CurrencyKey) => {
	let parsedCurrencyKey = currencyKey as string;

	// Using a switch so that we can add more currencies if the need arises.
	switch (currencyKey as string) {
		case 'sWTI':
			parsedCurrencyKey = 'sOIL';
			break;
		case 'sAPE':
			parsedCurrencyKey = 'sAPECOIN';
			break;
		default:
			break;
	}

	return `https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/synths/png/${parsedCurrencyKey}.png`;
};

const SYNTH_ICONS: Record<FuturesMarketKey | SynthsName | string, any> = {
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
	[CRYPTO_CURRENCY_MAP.SNX]: SNXIcon,
};

const CurrencyIconContainer: FC<CurrencyIconProps> = ({ className, ...props }) => (
	<Container className={className}>
		<CurrencyIcon {...props} />
		{!props.isDeprecated ? null : (
			<DeprecatedXIconContainer>
				<DeprecatedXIcon />
			</DeprecatedXIconContainer>
		)}
	</Container>
);

const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, isDeprecated, url, ...rest }) => {
	const [firstFallbackError, setFirstFallbackError] = useState(false);
	const [secondFallbackError, setSecondFallbackError] = useState(false);

	const OneInchTokenListQuery = useOneInchTokenList();
	const OneInchTokenListMap = OneInchTokenListQuery.isSuccess
		? OneInchTokenListQuery.data?.tokensMap ?? null
		: null;

	const props = {
		width: '30px',
		height: '30px',
		alt: currencyKey,
		...rest,
	};

	useEffect(() => {
		setFirstFallbackError(false);
	}, [currencyKey]);

	if (!firstFallbackError) {
		const src = SYNTH_ICONS[currencyKey as FuturesMarketKey];
		return src ? (
			<Image src={src} {...props} />
		) : (
			<TokenIcon
				{...{ isDeprecated }}
				src={url || getSynthIcon(currencyKey as CurrencyKey)}
				onError={() => setFirstFallbackError(true)}
				{...props}
				alt={currencyKey}
			/>
		);
	} else if (
		OneInchTokenListMap != null &&
		OneInchTokenListMap[currencyKey] != null &&
		!secondFallbackError
	) {
		return (
			<TokenIcon
				src={OneInchTokenListMap[currencyKey].logoURI}
				onError={() => setSecondFallbackError(true)}
				{...{ isDeprecated }}
				{...props}
			/>
		);
	} else {
		return (
			<Placeholder {...{ isDeprecated }} {...props}>
				{currencyKey}
			</Placeholder>
		);
	}
};

const Container = styled.div`
	position: relative;
	display: flex;
	align-items: center;

	& img {
		border-radius: 100%;
		border: 2px solid transparent;
	}
`;

const DeprecatedXIconContainer = styled.div`
	position: absolute;
	right: -3px;
	bottom: -3px;
`;

const Placeholder = styled(FlexDivCentered)<{
	isDeprecated?: boolean;
	height?: string;
	width?: string;
}>`
	border-radius: 100%;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	border: 2px solid
		${(props) =>
			props.isDeprecated
				? props.theme.colors.red
				: props.theme.colors.selectedTheme.button.text.primary};
	font-size: 7px;
	font-family: ${(props) => props.theme.fonts.bold};
	justify-content: center;
	margin: 0 auto;
	height: ${(props) => props.height};
	width: ${(props) => props.width};
`;

const TokenIcon = styled.img<{ isDeprecated?: boolean }>`
	border-radius: 100%;
	border: 2px solid ${(props) => (props.isDeprecated ? props.theme.colors.red : 'transparent')};
`;

export default CurrencyIconContainer;
