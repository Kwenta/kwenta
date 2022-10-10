import Image from 'next/image';
import React, { FC } from 'react';
import styled from 'styled-components';

import DeprecatedXIcon from 'assets/svg/app/deprecated-x.svg';
import { SYNTH_ICONS } from 'utils/icons';

import TokenIcon from './TokenIcon';

export type CurrencyIconProps = {
	currencyKey: string;
	className?: string;
	width?: string;
	height?: string;
	isDeprecated?: boolean;
	style?: any;
	url?: string;
};

const CurrencyIconContainer: FC<CurrencyIconProps> = React.memo(({ className, ...props }) => (
	<Container className={className}>
		<CurrencyIcon {...props} />
		{!props.isDeprecated ? null : (
			<DeprecatedXIconContainer>
				<DeprecatedXIcon />
			</DeprecatedXIconContainer>
		)}
	</Container>
));

const CurrencyIcon: FC<CurrencyIconProps> = React.memo(({ currencyKey, isDeprecated, ...rest }) => {
	const props = { width: '30px', height: '30px', alt: currencyKey, ...rest };
	const src = SYNTH_ICONS[currencyKey];

	if (src) {
		return <Image src={src} {...props} />;
	} else {
		return <TokenIcon currencyKey={currencyKey} isDeprecated={isDeprecated} {...props} />;
	}
});

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

export default CurrencyIconContainer;
