import React from 'react';
import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';
import Heading from './Heading';
import kwentaLogo from 'assets/svg/earn/KWENTA.svg';

export const BigText: React.FC<{ white?: boolean; logo?: boolean }> = ({
	children,
	white,
	logo,
}) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<TitleText $gold={!white}>{children}</TitleText>
			{logo && <KwentaLogo src={kwentaLogo} />}
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

const KwentaLogo = styled(Svg)`
	margin-left: 8px;
`;

export default BigText;
