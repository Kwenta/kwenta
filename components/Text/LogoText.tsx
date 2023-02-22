import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import KwentaLogo from 'assets/svg/earn/KWENTA.svg';

import Heading from './Heading';

type LogoTextProps = {
	yellow?: boolean;
	isToolTip?: boolean;
};

export const LogoText: FC<LogoTextProps> = memo(({ children, yellow, isToolTip = false }) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<TitleText $yellow={yellow}>{children}</TitleText>
			<KwentaLogo />
			{isToolTip && <SpacedHelpIcon />}
		</div>
	);
});

const TitleText = styled(Heading)<{ $yellow?: boolean; $mono?: boolean }>`
	font-size: 26px;
	margin-right: 8px;
	font-family: ${(props) => props.theme.fonts.monoBold};

	${(props) =>
		props.$yellow &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.yellow};
		`}
`;

const SpacedHelpIcon = styled(HelpIcon)`
	margin-left: 8px;
`;

export default LogoText;
