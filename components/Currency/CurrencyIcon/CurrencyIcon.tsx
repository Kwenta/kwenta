import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import DeprecatedXIcon from 'assets/svg/app/deprecated-x.svg';
import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';
import { CRYPTO_CURRENCY_MAP, CurrencyKey } from 'constants/currency';
import useOneInchTokenList from 'queries/tokenLists/useOneInchTokenList';
import useZapperTokenList from 'queries/tokenLists/useZapperTokenList';
import { FlexDivCentered } from 'styles/common';

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

export const SNXIcon =
	'https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/snx/SNX.svg';

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
	const [thirdFallbackError, setThirdFallbackError] = useState<boolean>(false);

	const ZapperTokenListQuery = useZapperTokenList();
	const ZapperTokenListMap = ZapperTokenListQuery.isSuccess
		? ZapperTokenListQuery.data?.tokensMap ?? null
		: null;

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
			case CRYPTO_CURRENCY_MAP.ETH: {
				return <ETHIcon {...props} />;
			}
			case CRYPTO_CURRENCY_MAP.SNX: {
				return <img src={SNXIcon} {...props} alt="snx-icon" />;
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
	} else if (
		ZapperTokenListMap != null &&
		ZapperTokenListMap[currencyKey] != null &&
		!thirdFallbackError
	) {
		return (
			<TokenIcon
				src={ZapperTokenListMap[currencyKey].logoURI}
				onError={() => setThirdFallbackError(true)}
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
