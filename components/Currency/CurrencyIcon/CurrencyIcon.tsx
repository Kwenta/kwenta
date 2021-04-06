import React, { FC, useMemo, useState } from 'react';
import Img from 'react-optimized-image';
import styled from 'styled-components';

import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';

import { CRYPTO_CURRENCY_MAP, CurrencyKey } from 'constants/currency';

import { FlexDivCentered } from 'styles/common';
import useSynthetixTokenList from 'queries/tokenLists/useSynthetixTokenList';

type CurrencyIconProps = {
	currencyKey: CurrencyKey;
	type?: 'synth' | 'asset';
	className?: string;
	width?: string;
	height?: string;
};

export const SNXIcon =
	'https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/snx/SNX.svg';

export const getSynthIcon = (currencyKey: CurrencyKey) =>
	`https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/synths/${currencyKey}.svg`;

export const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, ...rest }) => {
	const [isError, setIsError] = useState<boolean>(false);

	const synthetixTokenListQuery = useSynthetixTokenList();
	const synthetixTokenList = useMemo(
		() => (synthetixTokenListQuery.isSuccess ? synthetixTokenListQuery.data ?? null : null),
		[synthetixTokenListQuery.isSuccess, synthetixTokenListQuery.data]
	);

	const props = {
		width: '24px',
		height: '24px',
		alt: currencyKey,
		...rest,
	};

	if (isError) {
		return (
			<Placeholder style={{ width: props.width, height: props.height }}>{currencyKey}</Placeholder>
		);
	}

	switch (currencyKey) {
		case CRYPTO_CURRENCY_MAP.ETH: {
			return <Img src={ETHIcon} {...props} />;
		}
		case CRYPTO_CURRENCY_MAP.SNX: {
			// eslint-disable-next-line
			return <img src={SNXIcon} {...props} />;
		}
		default:
			return (
				// eslint-disable-next-line
				<img
					src={
						synthetixTokenList != null
							? synthetixTokenList[currencyKey].logoURI
							: getSynthIcon(currencyKey)
					}
					onError={() => setIsError(true)}
					{...props}
				/>
			);
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
