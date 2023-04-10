import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import KwentaLogo from 'assets/svg/earn/KWENTA.svg';
import OptimismLogo from 'assets/svg/providers/optimism.svg';

import Heading from './Heading';

type LogoTextProps = {
	yellow?: boolean;
	isToolTip?: boolean;
	kwentaIcon?: boolean;
	bold?: boolean;
};

export const LogoText: FC<LogoTextProps> = memo(
	({ children, yellow, isToolTip = false, bold = true, kwentaIcon = true }) => {
		return (
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<TitleText $yellow={yellow} $bold={bold}>
					{children}
				</TitleText>
				{kwentaIcon ? <KwentaLogo /> : <OptimismLogo height={18} width={18} />}
				{isToolTip && <SpacedHelpIcon />}
			</div>
		);
	}
);

const TitleText = styled(Heading)<{ $yellow?: boolean; $mono?: boolean; $bold?: boolean }>`
	font-size: 16px;
	margin-right: 8px;
	font-family: ${(props) => (props.$bold ? props.theme.fonts.monoBold : props.theme.fonts.mono)};

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
