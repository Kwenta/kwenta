import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { TabPanel } from 'components/Tab';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import SegmentedControl from '../../../components/SegmentedControl';
import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';
import { activeTabState } from '../../../store/futures';
import { useRecoilState } from 'recoil';
import FuturesMarketTab from './FuturesMarketTab';
import TradesHistoryTable from '../TradingHistory/TradesHistoryTable';

const FuturesMarketTabs: FC = () => {
	const { t } = useTranslation();

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];

	const [activeTab, setActiveTab] = useRecoilState(activeTabState);

	const DETAIL_TABS = [
		t('futures.market.sidebar-tab.markets'),
		t('futures.market.sidebar-tab.history'),
	];

	return (
		<>
			<StyledSegmentedControl
				values={DETAIL_TABS}
				selectedIndex={activeTab}
				onChange={setActiveTab}
			/>
			<TabPanel name={DETAIL_TABS[0]} activeTab={DETAIL_TABS[activeTab]}>
				<FuturesMarketTab futuresMarkets={futuresMarkets} />
			</TabPanel>
			<TabPanel name={DETAIL_TABS[1]} activeTab={DETAIL_TABS[activeTab]}>
				<TradesHistoryTable numberOfTrades={DEFAULT_NUMBER_OF_TRADES} />
			</TabPanel>
		</>
	);
};

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

export default FuturesMarketTabs;
