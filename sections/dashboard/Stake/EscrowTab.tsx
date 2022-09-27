import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import media from 'styles/media';

import EscrowTable from './EscrowTable';
import StakingInputCard from './StakingInputCard';

const EscrowTab = () => {
	const { t } = useTranslation();

	return (
		<EscrowTabContainer>
			<EscrowTable />
			<StakingInputCard inputLabel={t('dashboard.stake.tabs.stake-table.ekwenta-token')} />
		</EscrowTabContainer>
	);
};

const EscrowTabContainer = styled.div`
	${media.greaterThan('mdUp')`
		display: grid;
		grid-template-columns: 1fr 1fr;
		& > div {
			flex: 1;

			&:first-child {
				margin-right: 15px;
			}
		}
	`}

	${media.lessThan('mdUp')`
		& > div:first-child {
			margin-bottom: 15px;
		}
	`}
`;

export default EscrowTab;
