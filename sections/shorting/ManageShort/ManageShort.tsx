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
import { FlexDivRow } from 'styles/common';
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

	const [tabQuery, positionID] = useMemo(() => {
		if (router.query.tab) {
			const tab = castArray(router.query.tab)[0] as ShortingTab;
			const positionID = castArray(router.query.tab)[1] as ShortingTab;
			if (ShortingTabs.includes(tab)) {
				return [tab, positionID];
			}
		}
		return [null, null];
	}, [router.query]);

	const shortHistoryQuery = useShortHistoryQuery();
	const shortHistory = useMemo(() => shortHistoryQuery.data || [], [shortHistoryQuery.data]);
	const short = find(shortHistory, ({ id }) => id === Number(positionID ?? 0));

	const activeTab = tabQuery != null ? tabQuery : ShortingTab.AddCollateral;

	const TABS = useMemo(
		() =>
			short?.id != null
				? [
						{
							name: ShortingTab.AddCollateral,
							label: t('shorting.history.manageShort.sections.addCollateral.nav-title'),
							active: activeTab === ShortingTab.AddCollateral,
							onClick: () => router.push(ROUTES.Shorting.ManageShortAddCollateral(short.id)),
						},
						{
							name: ShortingTab.RemoveCollateral,
							label: t('shorting.history.manageShort.sections.removeCollateral.nav-title'),
							active: activeTab === ShortingTab.RemoveCollateral,
							onClick: () => router.push(ROUTES.Shorting.ManageShortRemoveCollateral(short.id)),
						},
						{
							name: ShortingTab.DecreasePosition,
							label: t('shorting.history.manageShort.sections.decreasePosition.nav-title'),
							active: activeTab === ShortingTab.DecreasePosition,
							onClick: () => router.push(ROUTES.Shorting.ManageShortDecreasePosition(short.id)),
						},
						{
							name: ShortingTab.IncreasePosition,
							label: t('shorting.history.manageShort.sections.increasePosition.nav-title'),
							active: activeTab === ShortingTab.IncreasePosition,
							onClick: () => router.push(ROUTES.Shorting.ManageShortIncreasePosition(short.id)),
						},
						{
							name: ShortingTab.ClosePosition,
							label: t('shorting.history.manageShort.sections.closePosition.nav-title'),
							active: activeTab === ShortingTab.ClosePosition,
							onClick: () => router.push(ROUTES.Shorting.ManageShortClosePosition(short.id)),
						},
				  ]
				: [],
		[t, activeTab, router, short?.id]
	);

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
					<div onClick={() => router.push(ROUTES.Shorting.Home)}>
						<StyledBackIcon src={BackIcon} viewBox={`0 0 ${BackIcon.width} ${BackIcon.height}`} />
					</div>
					<ManageShortTitle>{t('shorting.history.manageShort.title')}</ManageShortTitle>
					<YourPositionCard short={short} />
					<FlexDivRow>
						<LeftTabContainer>
							{TABS.map(({ name, label, active, onClick }) =>
								name === ShortingTab.ClosePosition ? null : (
									<StyledTabList key={name}>
										<TabButton name={name} active={active} onClick={onClick}>
											{label}
										</TabButton>
									</StyledTabList>
								)
							)}
						</LeftTabContainer>
						{TABS.length > 0 ? (
							<CloseTabButton
								key={TABS[TABS.length - 1].name}
								name={TABS[TABS.length - 1].name}
								active={TABS[TABS.length - 1].active}
								onClick={TABS[TABS.length - 1].onClick}
							>
								{TABS[TABS.length - 1].label}
							</CloseTabButton>
						) : null}
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

const LeftTabContainer = styled(FlexDivRow)`
	justify-content: flex-start;
`;

const CloseTabButton = styled(TabButton)`
	color: ${(props) => props.theme.colors.red};
	margin-bottom: 12px;
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
		cursor: pointer;
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

const StyledTabList = styled(TabList)`
	margin-bottom: 12px;
	margin-right: 30px;
`;

export default ManageShort;
