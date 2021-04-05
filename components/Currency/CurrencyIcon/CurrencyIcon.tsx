import React, { FC, useState } from 'react';
import Img from 'react-optimized-image';
import styled from 'styled-components';

import useSynthetixTokenList from 'queries/tokenLists/useSynthetixTokenList';
import use1InchTokenList from 'queries/tokenLists/use1InchTokenList';

import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';

import { CRYPTO_CURRENCY_MAP, CurrencyKey } from 'constants/currency';

import { FlexDivCentered } from 'styles/common';

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

	const synthetixTokenListQuery = useSynthetixTokenList({ enabled: false });
	const synthetixTokenListMap = synthetixTokenListQuery.isSuccess
		? synthetixTokenListQuery.data?.tokensMap ?? null
		: null;

	const OneInchTokenListQuery = use1InchTokenList({ enabled: false });
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
		return OneInchTokenListMap != null && OneInchTokenListMap[currencyKey] != null ? (
			<img
				src={OneInchTokenListMap[currencyKey].logoURI}
				onError={() => setIsError(true)}
				{...props}
			/>
		) : (
			defaultIcon
		);
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
							synthetixTokenListMap != null
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

export default CurrencyIcon;
