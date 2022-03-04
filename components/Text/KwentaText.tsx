import React from 'react';
import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';
import Heading from './Heading';
import kwentaLogo from 'assets/svg/earn/KWENTA.svg';

export const KwentaText: React.FC<{ white?: boolean }> = ({ children, white }) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<BigText $gold={!white}>{children}</BigText>
			<KwentaLogo src={kwentaLogo} />
		</div>
	);
};

export const BigText = styled(Heading) <{ $gold?: boolean }>`
	font-size: 25px;
	${(props) =>
		props.$gold &&
		css`
			color: ${(props) => props.theme.colors.common.primaryGold};
		`}
`;

const KwentaLogo = styled(Svg)`
	margin-left: 8px;
`;

export default KwentaText;
