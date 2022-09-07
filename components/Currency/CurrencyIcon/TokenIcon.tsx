import React from 'react';
import styled from 'styled-components';

import useOneInchTokenList from 'queries/tokenLists/useOneInchTokenList';
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

const TokenIcon: React.FC<TokenIconProps> = ({ currencyKey, ...props }) => {
	const OneInchTokenListQuery = useOneInchTokenList();
	const OneInchTokenListMap = OneInchTokenListQuery.data?.tokensMap ?? null;

	if (OneInchTokenListMap != null && OneInchTokenListMap[currencyKey] != null) {
		return <TokenImage src={OneInchTokenListMap[currencyKey].logoURI} {...props} />;
	} else {
		return (
			<Placeholder {...props}>{currencyKey === 'sDebtRatio' ? 'DEBT' : currencyKey}</Placeholder>
		);
	}
};

const TokenImage = styled.img<{ isDeprecated?: boolean }>`
	border-radius: 100%;
	border: 2px solid ${(props) => (props.isDeprecated ? props.theme.colors.red : 'transparent')};
`;

const Placeholder = styled(FlexDivCentered)<{
	isDeprecated?: boolean;
	height?: string;
	width?: string;
}>`
	border-radius: 100%;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	border: 2px solid
		${(props) =>
			props.isDeprecated ? props.theme.colors.red : props.theme.colors.selectedTheme.button.text};
	font-size: 7px;
	font-family: ${(props) => props.theme.fonts.bold};
	justify-content: center;
	margin: 0 auto;
	height: ${(props) => props.height};
	width: ${(props) => props.width};
`;

export default TokenIcon;
