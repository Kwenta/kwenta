import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
	@media only screen and (min-width: 600px) {
		// TODO: add media query for desktop
	}
	@media only screen and (min-width: 768px) {
		// TODO: add media query for tablet
	}
	@media only screen and (min-width: 992px) {
		// TODO: add media query for desktop
	}
	@media only screen and (min-width: 1200px) {
		// TODO: add media query for desktop
	}
`;

const StatsTitle = styled.h3`
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	font-size: 24px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-transform: uppercase;
`;

export const Stats = () => {
	const { t } = useTranslation();

	return (
		<Container>
			<StatsTitle>{t('stats.title')}</StatsTitle>
		</Container>
	);
};
