import React from 'react';
import styled, { css } from 'styled-components';

import KwentaLogo from 'assets/svg/earn/KWENTA.svg';

import Heading from './Heading';

export const BigText: React.FC<{ white?: boolean; logo?: boolean }> = ({
	children,
	white,
	logo,
}) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<TitleText $gold={!white}>{children}</TitleText>
			{logo && <StyledKwentaLogo />}
		</div>
	);
};

const TitleText = styled(Heading)<{ $gold?: boolean }>`
	font-size: 25px;
	${(props) =>
		props.$gold &&
		css`
			color: ${(props) => props.theme.colors.common.primaryGold};
		`}
`;

const StyledKwentaLogo = styled(KwentaLogo)`
	margin-left: 8px;
`;

export default BigText;
