import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Button from 'components/Button/Button';
import { TabList, TabPanel } from 'components/Tab';

enum Tab {
	Overview = 'overview',
	Positions = 'positions',
	Rewards = 'rewards',
	Markets = 'markets',
	Governance = 'governance',
	Staking = 'staking'
}

const Tabs = Object.values(Tab);

const Overview: FC = () => {
	const { t } = useTranslation();

	return (
		<>
			{/* Chart */}

			{/* Positions / Shorts / Spot Balances Buttons */}
			{/* Positions / Shorts / Spot Balances Table */}

			{/* Futures Markets / Spot Markets Buttons */}
			{/* Futures Markets / Spot Markets Table */}
		</>
	);
};

export default Overview;
