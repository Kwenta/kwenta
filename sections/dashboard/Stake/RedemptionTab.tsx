import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import media from 'styles/media';

import StakingInputCard from './StakingInputCard';

const RedemptionTab = () => {
	const { t } = useTranslation();

	return (
		<StakingTabContainer>
			<StakingInputCard
				inputLabel={t('dashboard.stake.tabs.stake-table.vkwenta-token')}
				tableType={'redeem'}
			/>
			<StakingInputCard
				inputLabel={t('dashboard.stake.tabs.stake-table.vekwenta-token')}
				tableType={'redeem'}
			/>
		</StakingTabContainer>
	);
};

const StakingTabContainer = styled.div`
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

export default RedemptionTab;
