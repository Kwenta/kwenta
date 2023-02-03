import { useTranslation } from 'react-i18next';

import { SplitContainer } from 'components/layout/grid';

import RedeemInputCard from './InputCards/RedeemInputCard';

const RedemptionTab = () => {
	const { t } = useTranslation();

	return (
		<SplitContainer>
			<RedeemInputCard inputLabel={t('dashboard.stake.tabs.stake-table.vkwenta-token')} isVKwenta />
			<RedeemInputCard
				inputLabel={t('dashboard.stake.tabs.stake-table.vekwenta-token')}
				isVKwenta={false}
			/>
		</SplitContainer>
	);
};

export default RedemptionTab;
