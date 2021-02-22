import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import find from 'lodash/find';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import castArray from 'lodash/castArray';

import ROUTES from 'constants/routes';
import { TabList, TabPanel, TabButton } from 'components/Tab';
import Loader from 'components/Loader';
import { CardTitle } from 'sections/dashboard/common';
import BackIcon from 'assets/svg/app/go-back.svg';
import { FlexDivRow, IconButton } from 'styles/common';
import useShortHistoryQuery from 'queries/short/useShortHistoryQuery';

import ManageShortAction from './ManageShortAction';
import YourPositionCard from './YourPositionCard';

export enum ShortingTab {
	AddCollateral = 'add-collateral',
	RemoveCollateral = 'remove-collateral',
	DecreasePosition = 'decrease-position',
	IncreasePosition = 'increase-position',
	ClosePosition = 'close-position',
}

const ShortingTabs = Object.values(ShortingTab);

const ManageShort: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const [tabQuery, loanId] = useMemo(() => {
		if (router.query.tab) {
			const tab = castArray(router.query.tab)[0] as ShortingTab;
			const loanId = castArray(router.query.tab)[1] as ShortingTab;
			if (ShortingTabs.includes(tab)) {
				return [tab, loanId];
			}
		}
		return [null, null];
	}, [router.query]);

	const shortHistoryQuery = useShortHistoryQuery();
	const shortHistory = useMemo(() => shortHistoryQuery.data || [], [shortHistoryQuery.data]);
	const short = useMemo(() => find(shortHistory, ({ id }) => id === Number(loanId ?? 0)), [
		shortHistory,
		loanId,
	]);

	const activeTab = tabQuery != null ? tabQuery : ShortingTab.AddCollateral;

	const TABS = useMemo(() => {
		return short?.id != null
			? [
					{
						name: ShortingTab.AddCollateral,
						label: t(
							`shorting.history.manageShort.sections.${ShortingTab.AddCollateral}.nav-title`
						),
						active: activeTab === ShortingTab.AddCollateral,
						onClick: () => router.push(ROUTES.Shorting.ManageShortAddCollateral(short.id)),
					},
					{
						name: ShortingTab.RemoveCollateral,
						label: t(
							`shorting.history.manageShort.sections.${ShortingTab.RemoveCollateral}.nav-title`
						),
						active: activeTab === ShortingTab.RemoveCollateral,
						onClick: () => router.push(ROUTES.Shorting.ManageShortRemoveCollateral(short.id)),
					},
					{
						name: ShortingTab.DecreasePosition,
						label: t(
							`shorting.history.manageShort.sections.${ShortingTab.DecreasePosition}.nav-title`
						),
						active: activeTab === ShortingTab.DecreasePosition,
						onClick: () => router.push(ROUTES.Shorting.ManageShortDecreasePosition(short.id)),
					},
					{
						name: ShortingTab.IncreasePosition,
						label: t(
							`shorting.history.manageShort.sections.${ShortingTab.IncreasePosition}.nav-title`
						),
						active: activeTab === ShortingTab.IncreasePosition,
						onClick: () => router.push(ROUTES.Shorting.ManageShortIncreasePosition(short.id)),
					},
					{
						isClosePosition: true,
						name: ShortingTab.ClosePosition,
						label: t(
							`shorting.history.manageShort.sections.${ShortingTab.ClosePosition}.nav-title`
						),
						active: activeTab === ShortingTab.ClosePosition,
						onClick: () => router.push(ROUTES.Shorting.ManageShortClosePosition(short.id)),
					},
			  ]
			: [];
	}, [t, activeTab, router, short?.id]);

	const leftTabs = useMemo(() => TABS.filter((tab) => !tab.isClosePosition), [TABS]);
	const closeTab = useMemo(() => TABS.find((tab) => tab.isClosePosition), [TABS]);

	// TODO: support for when a short is closed

	return (
		<Container>
			{short == null ? (
				shortHistoryQuery.isLoading ? (
					<Loader />
				) : (
					<NoResultsFound>{t('shorting.history.manageShort.noResults')}</NoResultsFound>
				)
			) : (
				<>
					<IconButton onClick={() => router.push(ROUTES.Shorting.Home)}>
						<StyledBackIcon src={BackIcon} viewBox={`0 0 ${BackIcon.width} ${BackIcon.height}`} />
					</IconButton>
					<ManageShortTitle>{t('shorting.history.manageShort.title')}</ManageShortTitle>
					<YourPositionCard short={short} />
					<FlexDivRow>
						<StyledTabList>
							{leftTabs.map(({ name, label, active, onClick }) => (
								<StyledTabButton key={name} name={name} active={active} onClick={onClick}>
									{label}
								</StyledTabButton>
							))}
							{closeTab != null ? (
								<CloseTabButton
									name={closeTab.name}
									active={closeTab.active}
									onClick={closeTab.onClick}
								>
									{TABS[TABS.length - 1].label}
								</CloseTabButton>
							) : null}
						</StyledTabList>
					</FlexDivRow>
					{TABS.map(({ name }) => (
						<TabPanel key={name} name={name} activeTab={activeTab}>
							<ManageShortAction tab={name} isActive={name === activeTab} short={short} />
						</TabPanel>
					))}
				</>
			)}
		</Container>
	);
};

const Container = styled.div`
	position: relative;
`;

const StyledTabButton = styled(TabButton)``;

const CloseTabButton = styled(TabButton)<{ active: boolean }>`
	color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.red)};
	margin-left: auto;
`;

const NoResultsFound = styled.div`
	background-color: ${(props) => props.theme.colors.elderberry};
	width: 100%;
	height: 400px;
	text-align: center;
	padding-top: 200px;
`;

const ManageShortTitle = styled(CardTitle)`
	margin-bottom: 12px;
	padding: 15px 0 10px 0;
	font-size: 26px;
	color: ${(props) => props.theme.colors.white};
`;

const StyledBackIcon = styled(Svg)`
	width: 18px;
	height: 18px;
	color: ${(props) => props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

const StyledTabList = styled(TabList)`
	display: flex;
	align-items: center;
	width: 100%;
	border-bottom: 0.5px solid ${(props) => props.theme.colors.navy};
	margin-bottom: 30px;
`;

export default ManageShort;
