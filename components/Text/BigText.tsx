import React from 'react';
import styled, { css } from 'styled-components';

import KwentaLogo from 'assets/svg/earn/KWENTA.svg';

import Heading from './Heading';

type BigTextProps = {
	yellow?: boolean;
	mono?: boolean;
	kwenta?: boolean;
};

export const BigText: React.FC<BigTextProps> = ({ children, yellow, mono, kwenta }) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<TitleText $yellow={yellow} $mono={mono}>
				{children}
			</TitleText>
			{kwenta && <KwentaLogo />}
		</div>
	);
};

const TitleText = styled(Heading)<{ $yellow?: boolean; $mono?: boolean }>`
	font-size: 25px;
	margin-right: 8px;

	${(props) =>
		props.$mono &&
		css`
			font-family: AkkuratMonoLLWeb-Regular;
		`}

	${(props) =>
		props.$yellow &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.yellow};
		`}
`;

export default BigText;
