import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import castArray from 'lodash/castArray';
import ROUTES from 'constants/routes';
import { TabList, TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';
import Leaderboard from '../Leaderboard';
import Statistics from '../Statistics';
import Search from 'components/Table/Search';

enum Tab {
	Leaderboard = 'leaderboard',
	Statistics = 'statistics',
}

const Tabs = Object.values(Tab);

const LeaderboardContainer: FC = () => {
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState<string | null>();

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

	const onChangeSearch = (text: string) => {
		setSearchTerm(text?.toLowerCase());
	};

	return (
		<>
			<TabButtonsContainer>
				{TABS.map(({ name, label, active, onClick }) => (
					<TabButton
						key={name}
						title={label}
						active={active}
						onClick={onClick}
					/>
				))}
				<Search
					onChange={onChangeSearch}
					disabled={!(activeTab === Tab.Leaderboard)}
				/>
			</TabButtonsContainer>
			<TabPanel name={Tab.Leaderboard} activeTab={activeTab}>
				<Leaderboard
					searchTerm={searchTerm}
				/>
			</TabPanel>
			<TabPanel name={Tab.Statistics} activeTab={activeTab}>
				<Statistics />
			</TabPanel>
		</>
	);
};

const TabButtonsContainer = styled.div`
	display: flex;
	margin-top: 16px;
	height: 35px;

	& > button {
		margin-right: 14px;
	}
`;


export default LeaderboardContainer;
