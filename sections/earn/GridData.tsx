import { FC, memo } from 'react';
import styled from 'styled-components';

import { LogoText, Body, Heading } from 'components/Text';
import media from 'styles/media';

type GridDataProps = {
	title: string;
	value: string;
	hasKwentaLogo?: boolean;
};

const GridData: FC<GridDataProps> = memo(({ title, value, hasKwentaLogo, children }) => (
	<GridDataContainer>
		<Title>{title}</Title>
		{hasKwentaLogo ? (
			<LogoText yellow>{value}</LogoText>
		) : (
			<YellowHeading fontSize={25}>{value}</YellowHeading>
		)}
		{children}
	</GridDataContainer>
));

const Title = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 14px;
	margin-bottom: 5px;
`;

const GridDataContainer = styled.div`
	padding: 20px 24px 18px;
	min-height: 95px;

	${media.lessThan('mdUp')`
		padding: 20px 16px;
   `}
`;

const YellowHeading = styled(Heading)`
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
`;

export default GridData;
