import { FC, useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Connector from 'containers/Connector';
import { NetworkIdByName } from '@synthetixio/contracts-interface';
import { TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import FuturesMarketsTable from '../FuturesMarketsTable';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import SpotMarketsTable from '../SpotMarketsTable';

enum MarketsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const Markets: FC = () => {
	const { t } = useTranslation();

	const { network } = Connector.useContainer();

	const isL2MainnetOrL2Kovan =
		network.id === NetworkIdByName['mainnet-ovm'] || network.id === NetworkIdByName['kovan-ovm'];

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(
		isL2MainnetOrL2Kovan ? MarketsTab.FUTURES : MarketsTab.SPOT
	);

	useEffect(() => {
		if (isL2MainnetOrL2Kovan) {
			setActiveMarketsTab(MarketsTab.FUTURES);
		} else {
			setActiveMarketsTab(MarketsTab.SPOT);
		}
	}, [isL2MainnetOrL2Kovan]);

	const MARKETS_TABS = useMemo(
		() =>
			isL2MainnetOrL2Kovan
				? [
						{
							name: MarketsTab.FUTURES,
							label: t('dashboard.overview.markets-tabs.futures'),
							active: activeMarketsTab === MarketsTab.FUTURES,
							onClick: () => {
								setActiveMarketsTab(MarketsTab.FUTURES);
							},
						},
						{
							name: MarketsTab.SPOT,
							label: t('dashboard.overview.markets-tabs.spot'),
							active: activeMarketsTab === MarketsTab.SPOT,
							onClick: () => {
								setActiveMarketsTab(MarketsTab.SPOT);
							},
						},
				  ]
				: [
						{
							name: MarketsTab.SPOT,
							label: t('dashboard.overview.markets-tabs.spot'),
							active: activeMarketsTab === MarketsTab.SPOT,
							onClick: () => {
								setActiveMarketsTab(MarketsTab.SPOT);
							},
						},
				  ],
		[activeMarketsTab, isL2MainnetOrL2Kovan, t]
	);

	return (
		<>
			<TabButtonsContainer>
				{MARKETS_TABS.map(({ name, label, active, onClick }) => (
					<TabButton key={name} title={label} active={active} onClick={onClick} />
				))}
			</TabButtonsContainer>
			{isL2MainnetOrL2Kovan && (
				<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
					<FuturesMarketsTable futuresMarkets={futuresMarkets} />
				</TabPanel>
			)}

			<TabPanel name={MarketsTab.SPOT} activeTab={activeMarketsTab}>
				<SpotMarketsTable exchangeRates={exchangeRates} />
			</TabPanel>
		</>
	);
};

const TabButtonsContainer = styled.div`
	display: flex;
	margin-top: 16px;
	margin-bottom: 16px;

	& > button {
		height: 38px;
		font-size: 13px;

		&:not(:last-of-type) {
			margin-right: 14px;
		}
	}
`;

export default Markets;
