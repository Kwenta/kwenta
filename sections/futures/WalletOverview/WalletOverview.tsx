import React from 'react';
import { useTranslation } from 'react-i18next';

import { SYNTHS_MAP } from 'constants/currency';
import { Title } from '../common';
import OverviewRow from './OverviewRow';
import PerformanceChart from './PerformanceChart';

type WalletOverviewProps = {};

const WalletOverview: React.FC<WalletOverviewProps> = ({}) => {
	const { t } = useTranslation();
	return (
		<div>
			<Title>{t('futures.wallet-overview.title')}</Title>
			<OverviewRow
				subtitle={t('futures.wallet-overview.balance')}
				data={1500}
				currencyKey={SYNTHS_MAP.sUSD}
				sign={`$`}
			/>
			<OverviewRow
				subtitle={t('futures.wallet-overview.margin-deployed')}
				data={2500}
				currencyKey={SYNTHS_MAP.sUSD}
				sign={`$`}
			/>
			<PerformanceChart changeNumber={2000} changePercent={8} />
		</div>
	);
};
export default WalletOverview;
