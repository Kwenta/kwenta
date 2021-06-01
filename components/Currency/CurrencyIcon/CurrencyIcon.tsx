import React, { FC, useState } from 'react';
import Img from 'react-optimized-image';
import styled from 'styled-components';

import useSynthetixTokenList from 'queries/tokenLists/useSynthetixTokenList';
import useZapperTokenList from 'queries/tokenLists/useZapperTokenList';

import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';

import { CRYPTO_CURRENCY_MAP, CurrencyKey } from 'constants/currency';

import { FlexDivCentered } from 'styles/common';
import useOneInchTokenList from 'queries/tokenLists/useOneInchTokenList';

export type CurrencyIconProps = {
	currencyKey: CurrencyKey;
	type?: 'synth' | 'asset' | 'token';
	className?: string;
	width?: string;
	height?: string;
};

export const SNXIcon =
	'https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/snx/SNX.svg';

export const getSynthIcon = (currencyKey: CurrencyKey) =>
	`https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/synths/${currencyKey}.svg`;

export const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, type, ...rest }) => {
	const [isError, setIsError] = useState<boolean>(false);

	const synthetixTokenListQuery = useSynthetixTokenList();
	const synthetixTokenListMap = synthetixTokenListQuery.isSuccess
		? synthetixTokenListQuery.data?.tokensMap ?? null
		: null;

	const ZapperTokenListQuery = useZapperTokenList();
	const ZapperTokenListMap = ZapperTokenListQuery.isSuccess
		? ZapperTokenListQuery.data?.tokensMap ?? null
		: null;

	const OneInchTokenListQuery = useOneInchTokenList();
	const OneInchTokenListMap = OneInchTokenListQuery.isSuccess
		? OneInchTokenListQuery.data?.tokensMap ?? null
		: null;

	const props = {
		width: '24px',
		height: '24px',
		alt: currencyKey,
		...rest,
	};

	const defaultIcon = (
		<Placeholder style={{ width: props.width, height: props.height }}>{currencyKey}</Placeholder>
	);

	if (isError) {
		return defaultIcon;
	}

	if (type === 'token') {
		if (ZapperTokenListMap != null && ZapperTokenListMap[currencyKey] != null) {
			return (
				<TokenIcon
					src={ZapperTokenListMap[currencyKey].logoURI}
					onError={() => setIsError(true)}
					{...props}
				/>
			);
		} else if (OneInchTokenListMap != null && OneInchTokenListMap[currencyKey] != null) {
			return (
				<TokenIcon
					src={OneInchTokenListMap[currencyKey].logoURI}
					onError={() => setIsError(true)}
					{...props}
				/>
			);
		} else {
			return defaultIcon;
		}
	} else {
		switch (currencyKey) {
			case CRYPTO_CURRENCY_MAP.ETH: {
				return <Img src={ETHIcon} {...props} />;
			}
			case CRYPTO_CURRENCY_MAP.SNX: {
				return <img src={SNXIcon} {...props} />;
			}
			default:
				return (
					<img
						src={
							synthetixTokenListMap != null && synthetixTokenListMap[currencyKey] != null
								? synthetixTokenListMap[currencyKey].logoURI
								: getSynthIcon(currencyKey)
						}
						onError={() => setIsError(true)}
						{...props}
					/>
				);
		}
	}
};

const Placeholder = styled(FlexDivCentered)`
	border-radius: 100%;
	color: ${(props) => props.theme.colors.white};
	border: 1px solid ${(props) => props.theme.colors.white};
	font-size: 7px;
	font-family: ${(props) => props.theme.fonts.bold};
	justify-content: center;
	margin: 0 auto;
`;

const TokenIcon = styled.img`
	border-radius: 100%;
`;

export default CurrencyIcon;
