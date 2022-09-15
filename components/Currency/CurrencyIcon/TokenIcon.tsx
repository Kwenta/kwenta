import mainnetOneInchTokenList from 'data/token-lists/mainnet.json';
import optimismOneInchTokenList from 'data/token-lists/optimism.json';
import { useMemo } from 'react';
import styled from 'styled-components';

import useIsL2 from 'hooks/useIsL2';
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
	// TODO: Find a way to do this without checking if we're on L2 or not.
	const isL2 = useIsL2();
	const tokenMap: any = useMemo(
		() => (isL2 ? optimismOneInchTokenList.tokensMap : mainnetOneInchTokenList.tokensMap),
		[isL2]
	);

	if (tokenMap[currencyKey] != null) {
		return <TokenImage src={tokenMap[currencyKey].logoURI} {...props} />;
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

export default TokenIcon;
