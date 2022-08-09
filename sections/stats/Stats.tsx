import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div``;

export const Stats = () => {
	const { t } = useTranslation();

	return (
		<Container>
			<h3>{t('stats.title')}</h3>
		</Container>
	);
};
