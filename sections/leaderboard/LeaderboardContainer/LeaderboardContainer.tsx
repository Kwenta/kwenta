import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import castArray from 'lodash/castArray';
import ROUTES from 'constants/routes';
import { TabList, TabPanel, TabButton } from 'components/Tab';
import Leaderboard from '../Leaderboard';
import Statistics from '../Statistics';

enum Tab {
	Leaderboard = 'leaderboard',
	Statistics = 'statistics',
}

const Tabs = Object.values(Tab);

const LeaderboardContainer: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const tabQuery = useMemo(() => {
		if (router.query.tab) {
			const tab = castArray(router.query.tab)[0] as Tab;
			if (Tabs.includes(tab)) {
				return tab;
			}
		}
		return null;
	}, [router.query]);

	const activeTab = tabQuery != null ? tabQuery : Tab.Leaderboard;

	const TABS = useMemo(
		() => [
			{
				name: Tab.Leaderboard,
				label: t('leaderboard.tabs.nav.leaderboard'),
				active: activeTab === Tab.Leaderboard,
				onClick: () => router.push(ROUTES.Leaderboard.Leaderboard),
			},
			{
				name: Tab.Statistics,
				label: t('leaderboard.tabs.nav.statistics'),
				active: activeTab === Tab.Statistics,
				onClick: () => router.push(ROUTES.Leaderboard.Statistics),
			},
		],
		[t, activeTab, router]
	);

	return (
		<>
			<StyledTabList>
				{TABS.map(({ name, label, active, onClick }) => (
					<TabButton key={name} name={name} active={active} onClick={onClick}>
						{label}
					</TabButton>
				))}
			</StyledTabList>
			<TabPanel name={Tab.Leaderboard} activeTab={activeTab}>
				<Leaderboard />
			</TabPanel>
			<TabPanel name={Tab.Statistics} activeTab={activeTab}>
				<Statistics />
			</TabPanel>
		</>
	);
};

const StyledTabList = styled(TabList)`
	margin-bottom: 12px;
`;

export default LeaderboardContainer;
