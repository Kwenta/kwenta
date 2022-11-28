import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import NavButton from 'components/Button/NavButton';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { TabList, TabPanel } from 'components/Tab';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { MainContent, LeftSideContent, FullHeightContainer, PageContent } from 'styles/common';

import Links from '../Links';

enum Tab {
	Overview = 'overview',
	History = 'history',
	Markets = 'markets',
	Governance = 'governance',
	Stake = 'staking',
	Earn = 'earn',
}

const Tabs = Object.values(Tab);

const DashboardLayout: FC = ({ children }) => {
	const { t } = useTranslation();
	const router = useRouter();

	const tabQuery = useMemo(() => {
		if (router.pathname) {
			const tab = router.pathname.split('/')[2] as Tab;
			if (Tabs.includes(tab)) return tab;
		}

		return null;
	}, [router.pathname]);

	const activeTab = tabQuery ?? Tab.Overview;

	const TABS = useMemo(
		() => [
			{
				name: Tab.Overview,
				label: t('dashboard.tabs.overview'),
				active: activeTab === Tab.Overview,
				onClick: () => router.push(ROUTES.Dashboard.Home),
			},
			{
				name: Tab.History,
				label: t('dashboard.tabs.history'),
				active: activeTab === Tab.History,
				onClick: () => router.push(ROUTES.Dashboard.History),
			},
			{
				name: Tab.Markets,
				label: t('dashboard.tabs.markets'),
				active: activeTab === Tab.Markets,
				disabled: false,
				onClick: () => router.push(ROUTES.Dashboard.Markets),
			},
			{
				name: Tab.Stake,
				label: t('dashboard.tabs.staking'),
				active: activeTab === Tab.Stake,
				onClick: () => router.push(ROUTES.Dashboard.Stake),
			},
			{
				name: Tab.Earn,
				label: t('dashboard.tabs.earn'),
				active: activeTab === Tab.Earn,
				onClick: () => router.push(ROUTES.Dashboard.Earn),
			},
			{
				name: Tab.Governance,
				label: t('dashboard.tabs.governance'),
				active: activeTab === Tab.Governance,
				onClick: () => window.open(EXTERNAL_LINKS.Governance.Vote, '_blank'),
			},
		],
		[t, activeTab, router]
	);

	return (
		<AppLayout>
			<DesktopOnlyView>
				<PageContent>
					<StyledFullHeightContainer>
						<LeftSideContent>
							<StyledTabList>
								<TabGroupTitle>{t('dashboard.titles.trading')}</TabGroupTitle>
								{TABS.slice(0, 3).map(({ name, label, active, disabled, onClick }) => (
									<NavButton
										key={name}
										title={name}
										isActive={active}
										disabled={disabled}
										onClick={onClick}
										noOutline
									>
										{label}
									</NavButton>
								))}

								<TabGroupTitle>{t('dashboard.titles.community')}</TabGroupTitle>
								{TABS.slice(3).map(({ name, label, active, disabled, onClick }) => (
									<NavButton
										key={name}
										title={name}
										isActive={active}
										disabled={disabled}
										onClick={onClick}
										noOutline
									>
										{label}
									</NavButton>
								))}
							</StyledTabList>
							<Links />
						</LeftSideContent>
						<MainContent>
							<TabPanel name={activeTab} activeTab={activeTab}>
								{children}
							</TabPanel>
						</MainContent>
					</StyledFullHeightContainer>
				</PageContent>
			</DesktopOnlyView>
			<MobileOrTabletView>{children}</MobileOrTabletView>
		</AppLayout>
	);
};

const StyledTabList = styled(TabList)`
	display: flex;
	flex-direction: column;
	margin-bottom: 12px;
`;

const TabGroupTitle = styled.div`
	margin-bottom: 10px;
	margin-left: 14px;
	font-size: 13px;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.black};
	color: ${(props) => props.theme.colors.common.primaryGold};

	&:not(:first-of-type) {
		margin-top: 65px;
	}
`;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`;

export default DashboardLayout;
