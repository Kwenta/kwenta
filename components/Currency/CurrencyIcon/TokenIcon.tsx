import { FC, memo } from 'react';
import styled from 'styled-components';

import { useAppSelector } from 'state/hooks';
import { FlexDivCentered } from 'styles/common';

export type TokenIconProps = {
	currencyKey: string;
	type?: 'synth' | 'asset' | 'token';
	className?: string;
	width?: string;
	height?: string;
	isDeprecated?: boolean;
	style?: any;
	url?: string;
};

const TokenIcon: FC<TokenIconProps> = memo(({ currencyKey, isDeprecated, ...props }) => {
	const tokensMap = useAppSelector(({ exchange }) => exchange.tokensMap);

	if (!!tokensMap[currencyKey]) {
		return (
			<TokenImage src={tokensMap[currencyKey].logoURI} $isDeprecated={isDeprecated} {...props} />
		);
	} else {
		return (
			<Placeholder $isDeprecated={isDeprecated} {...props}>
				{currencyKey === 'sDebtRatio' ? 'DEBT' : currencyKey}
			</Placeholder>
		);
	}
});

const TokenImage = styled.img<{ $isDeprecated?: boolean }>`
	border-radius: 100%;
	border: 2px solid ${(props) => (props.$isDeprecated ? props.theme.colors.red : 'transparent')};
`;

const Placeholder = styled(FlexDivCentered)<{
	$isDeprecated?: boolean;
	height?: string;
	width?: string;
}>`
	border-radius: 100%;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	border: 2px solid
		${(props) =>
			props.$isDeprecated
				? props.theme.colors.red
				: props.theme.colors.selectedTheme.button.text.primary};
	font-size: 7px;
	font-family: ${(props) => props.theme.fonts.bold};
	justify-content: center;
	margin: 0 auto;
	height: ${(props) => props.height};
	width: ${(props) => props.width};
`;

export default TokenIcon;
