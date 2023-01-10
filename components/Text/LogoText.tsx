import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import KwentaLogo from 'assets/svg/earn/KWENTA.svg';

import Heading from './Heading';

type LogoTextProps = {
	yellow?: boolean;
};

export const LogoText: FC<LogoTextProps> = memo(({ children, yellow }) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<TitleText $yellow={yellow}>{children}</TitleText>
			<KwentaLogo />
		</div>
	);
});

const TitleText = styled(Heading)<{ $yellow?: boolean; $mono?: boolean }>`
	font-size: 25px;
	margin-right: 8px;
	font-family: AkkuratMonoLLWeb-Regular;

	${(props) =>
		props.$yellow &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.yellow};
		`}
`;

export default LogoText;
