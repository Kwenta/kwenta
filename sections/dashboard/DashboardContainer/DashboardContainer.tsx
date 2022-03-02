import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import castArray from 'lodash/castArray';
import ROUTES from 'constants/routes';
import NavButton from 'components/Button/NavButton';
import { TabList, TabPanel } from 'components/Tab';
import {
	MainContent,
	LeftSideContent,
} from 'styles/common';

enum Tab {
	Overview = 'overview',
	Positions = 'positions',
	Rewards = 'rewards',
	Markets = 'markets',
	Governance = 'governance',
	Staking = 'staking'
}

const Tabs = Object.values(Tab);

const DashboardContainer: FC = () => {
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

	const activeTab = tabQuery != null ? tabQuery : Tab.Overview;

	const TABS = useMemo(
		() => [
			{
				name: Tab.Overview,
				label: t('futures-dashboard.tabs.nav.overview'),
				active: activeTab === Tab.Overview,
				onClick: () => router.push(ROUTES.Home.Overview),
			},
			{
				name: Tab.Positions,
				label: t('futures-dashboard.tabs.nav.positions'),
				active: activeTab === Tab.Positions,
				disabled: true,
				onClick: () => {},
			},
			{
				name: Tab.Rewards,
				label: t('futures-dashboard.tabs.nav.rewards'),
				active: activeTab === Tab.Rewards,
				disabled: true,
				onClick: () => {},
			},
			{
				name: Tab.Markets,
				label: t('futures-dashboard.tabs.nav.markets'),
				active: activeTab === Tab.Markets,
				disabled: true,
				onClick: () => {},
			},
			{
				name: Tab.Governance,
				label: t('futures-dashboard.tabs.nav.governance'),
				active: activeTab === Tab.Governance,
				disabled: true,
				onClick: () => { },
			},
			{
				name: Tab.Staking,
				label: t('futures-dashboard.tabs.nav.staking'),
				active: activeTab === Tab.Staking,
				disabled: true,
				onClick: () => { },
			},
		],
		[t, activeTab, router]
	);

	return (
		<>
			<LeftSideContent>
				<StyledTabList>
					<TabGroupTitle>Trading</TabGroupTitle>
					{TABS.slice(0, 4).map(({ name, label, active, disabled, onClick }) => (
						<NavButton key={name} title={name} isActive={active} disabled={disabled} onClick={onClick} >
							{label}
						</NavButton>
					))}

					<TabGroupTitle>Community</TabGroupTitle>
					{TABS.slice(4).map(({ name, label, active, disabled, onClick }) => (
						<NavButton key={name} title={name} isActive={active} disabled={disabled} onClick={onClick} >
							{label}
						</NavButton>
					))}
				</StyledTabList>
			</LeftSideContent>
			<MainContent>
				<TabPanel name={Tab.Overview} activeTab={activeTab}>
				</TabPanel>
			</MainContent>
		</>
	);
};

const StyledTabList = styled(TabList)`
	display: flex;
	flex-direction: column;
	margin-bottom: 12px;
`;

const TabGroupTitle = styled.div`
	margin-top: 35px;
	margin-bottom: 10px;
	margin-left: 14px;
	font-size: 13px;
	text-transform: uppercase;
	font-weight: 900;
	color: ${(props) => props.theme.colors.purple};
`;

export default DashboardContainer;
