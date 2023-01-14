import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { HeaderContainer } from 'components/mobile/dashboard';
import { SectionHeader, SectionTitle } from 'components/mobile/futures';

import SpotMarketsTable from '../SpotMarketsTable';

const SpotMarkets: React.FC = () => {
	const { t } = useTranslation();

	return (
		<>
			<CustomHeaderContainer>
				<CustomSectionHeader>
					<SectionTitle>{t('dashboard.overview.markets-tabs.spot')}</SectionTitle>
				</CustomSectionHeader>
			</CustomHeaderContainer>

			<SpotMarketsTable />
		</>
	);
};

const CustomHeaderContainer = styled(HeaderContainer)`
	margin-bottom: 0px;
	padding-bottom: 0px;
`;

const CustomSectionHeader = styled(SectionHeader)`
	margin-bottom: 0px;
`;

export default SpotMarkets;
