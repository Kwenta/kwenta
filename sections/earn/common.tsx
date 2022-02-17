import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';

import Text from 'components/Text';
import kwentaLogo from 'assets/svg/earn/KWENTA.svg';

export const KwentaText: React.FC<{ white?: boolean }> = ({ children, white }) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<BigText $gold={!white}>{children}</BigText>
			<KwentaLogo src={kwentaLogo} />
		</div>
	);
};

export const BigText = styled(Text.Heading)<{ $gold?: boolean }>`
	font-size: 25px;
	${(props) =>
		props.$gold &&
		css`
			color: ${(props) => props.theme.colors.common.primaryGold};
		`}
`;

export const Title = styled(Text.Body)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 14px;
	margin-bottom: 10px;
`;

export const Description = styled(Text.Body)`
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const KwentaLogo = styled(Svg)`
	margin-left: 8px;
`;
