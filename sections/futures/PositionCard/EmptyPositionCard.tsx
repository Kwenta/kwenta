import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Body } from 'components/Text';
import ROUTES from 'constants/routes';
import { linkCSS } from 'styles/common';

type EmptyPositionCardProps = {};

const EmptyPositionCard: React.FC<EmptyPositionCardProps> = () => {
	const { t } = useTranslation();

	return (
		<>
			<Container>
				<Title>{t('futures.market.empty-position-card.no-position')}</Title>
				<Link href={ROUTES.Dashboard.Markets} passHref>
					<StyledLink>{t('futures.market.empty-position-card.explore-markets')}</StyledLink>
				</Link>
			</Container>
		</>
	);
};

export default EmptyPositionCard;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: transparent;
	margin-bottom: 15px;
	min-height: 100px;
	padding: 15px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
`;

const Title = styled(Body).attrs({ mono: true })`
	font-size: 15px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.white};
`;

const StyledLink = styled.a`
	${linkCSS};
	font-size: 13px;
	text-decoration: underline;
	color: ${(props) => props.theme.colors.selectedTheme.gray};

	&:hover {
		text-decoration: underline;
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}
`;
