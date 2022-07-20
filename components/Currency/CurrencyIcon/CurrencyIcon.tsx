import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';

import ETHIcon from 'assets/png/currencies/sETH.png';
import UNIIcon from 'assets/png/currencies/sUni.png';
import SOLIcon from 'assets/png/currencies/sSOL.png';
import BTCIcon from 'assets/png/currencies/sBTC.png';
import AVAXIcon from 'assets/png/currencies/sAVAX.png';
import MATICIcon from 'assets/png/currencies/sMATIC.png';
import LINKIcon from 'assets/png/currencies/sLINK.png';
import APEIcon from 'assets/png/currencies/sAPECOIN.png';
import AAVEIcon from 'assets/png/currencies/sAAVE.png';
import DYDXIcon from 'assets/png/currencies/sDYDX.png';
import XAUIcon from 'assets/png/currencies/sXAU.png';
import XAGIcon from 'assets/png/currencies/sXAG.png';
import EURIcon from 'assets/png/currencies/sEUR.png';
import USDIcon from 'assets/png/currencies/sUSD.png';
import INRIcon from 'assets/png/currencies/sINR.png';
import SNXIcon from 'assets/png/currencies/SNX.png';
import DeprecatedXIcon from 'assets/svg/app/deprecated-x.svg';

import { CRYPTO_CURRENCY_MAP, CurrencyKey } from 'constants/currency';

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

const CurrencyIconContainer: FC<CurrencyIconProps> = (props) => (
	<Container>
		<CurrencyIcon style={props.style} {...props} />
		{!props.isDeprecated ? null : (
			<DeprecatedXIconContainer>
				<DeprecatedXIcon />
			</DeprecatedXIconContainer>
		)}
	</Container>
);

const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, type, isDeprecated, url, ...rest }) => {
	const [firstFallbackError, setFirstFallbackError] = useState<boolean>(false);
	const [secondFallbackError, setSecondFallbackError] = useState<boolean>(false);

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
		switch (currencyKey) {
			case FuturesMarketKey.sETH: {
				return <Image src={ETHIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sUNI: {
				return <Image src={UNIIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sBTC: {
				return <Image src={BTCIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sSOL: {
				return <Image src={SOLIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sAVAX: {
				return <Image src={AVAXIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sMATIC: {
				return <Image src={MATICIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sLINK: {
				return <Image src={LINKIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sAPE: {
				return <Image src={APEIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sAAVE: {
				return <Image src={AAVEIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sDYDX: {
				return <Image src={DYDXIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sXAU: {
				return <Image src={XAUIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sXAG: {
				return <Image src={XAGIcon} layout="raw" {...props} />;
			}
			case FuturesMarketKey.sEUR: {
				return <Image src={EURIcon} layout="raw" {...props} />;
			}
			case 'sUSD': {
				return <Image src={USDIcon} layout="raw" {...props} />;
			}
			case 'sINR': {
				return <Image src={INRIcon} layout="raw" {...props} />;
			}
			case CRYPTO_CURRENCY_MAP.SNX: {
				return <Image src={SNXIcon} layout="raw" {...props} />;
			}
			default:
				return (
					<TokenIcon
						{...{ isDeprecated }}
						src={url || getSynthIcon(currencyKey as CurrencyKey)}
						onError={() => setFirstFallbackError(true)}
						{...props}
						alt={currencyKey}
					/>
				);
		}
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
			<Placeholder
				{...{ isDeprecated }}
				style={{ width: props.width, height: props.height }}
				{...props}
			>
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

const Placeholder = styled(FlexDivCentered)<{ isDeprecated?: boolean }>`
	border-radius: 100%;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	border: 2px solid
		${(props) =>
			props.isDeprecated ? props.theme.colors.red : props.theme.colors.selectedTheme.button.text};
	font-size: 7px;
	font-family: ${(props) => props.theme.fonts.bold};
	justify-content: center;
	margin: 0 auto;
`;

const TokenIcon = styled.img<{ isDeprecated?: boolean }>`
	border-radius: 100%;
	border: 2px solid ${(props) => (props.isDeprecated ? props.theme.colors.red : 'transparent')};
`;

export default CurrencyIconContainer;
