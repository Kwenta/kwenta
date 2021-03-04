import { FC, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import castArray from 'lodash/castArray';
import add from 'date-fns/add';
import isAfter from 'date-fns/isAfter';
import Countdown, { zeroPad } from 'react-countdown';

import ROUTES from 'constants/routes';

import useCollateralShortPositionQuery from 'queries/collateral/useCollateralShortPositionQuery';
import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';

import { TabList, TabPanel, TabButton } from 'components/Tab';
import Loader from 'components/Loader';

import { CardTitle } from 'sections/dashboard/common';

import BackIcon from 'assets/svg/app/go-back.svg';

import { FlexDivRow, IconButton, CenteredMessage } from 'styles/common';

import ManageShortAction from './ManageShortAction';
import PositionCard from './PositionCard';
import { ShortingTab, ShortingTabs } from './constants';

const ManageShort: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [inputAmount, setInputAmount] = useState<string>('');

	const [tabQuery, loanId] = useMemo(() => {
		if (router.query.tab) {
			const tab = castArray(router.query.tab)[0] as ShortingTab;
			const loanId = castArray(router.query.tab)[1] as string;
			if (ShortingTabs.includes(tab)) {
				return [tab, loanId];
			}
		}
		return [null, null];
	}, [router.query]);

	const shortPositionQuery = useCollateralShortPositionQuery(loanId);

	const short = useMemo(() => (shortPositionQuery.isSuccess ? shortPositionQuery.data : null), [
		shortPositionQuery.data,
		shortPositionQuery.isSuccess,
	]);

	const collateralShortContractInfoQuery = useCollateralShortContractInfoQuery();

	const collateralShortInfo = useMemo(
		() =>
			collateralShortContractInfoQuery.isSuccess
				? collateralShortContractInfoQuery.data ?? null
				: null,
		[collateralShortContractInfoQuery.isSuccess, collateralShortContractInfoQuery.data]
	);

	const activeTab = useMemo(() => (tabQuery != null ? tabQuery : ShortingTab.AddCollateral), [
		tabQuery,
	]);

	const TABS = useMemo(() => {
		return short?.id != null
			? [
					{
						name: ShortingTab.AddCollateral,
						label: t(
							`shorting.history.manage-short.sections.${ShortingTab.AddCollateral}.nav-title`
						),
						active: activeTab === ShortingTab.AddCollateral,
						onClick: () => router.push(ROUTES.Shorting.ManageShortAddCollateral(short.id)),
					},
					{
						name: ShortingTab.RemoveCollateral,
						label: t(
							`shorting.history.manage-short.sections.${ShortingTab.RemoveCollateral}.nav-title`
						),
						active: activeTab === ShortingTab.RemoveCollateral,
						onClick: () => router.push(ROUTES.Shorting.ManageShortRemoveCollateral(short.id)),
					},
					{
						name: ShortingTab.IncreasePosition,
						label: t(
							`shorting.history.manage-short.sections.${ShortingTab.IncreasePosition}.nav-title`
						),
						active: activeTab === ShortingTab.IncreasePosition,
						onClick: () => router.push(ROUTES.Shorting.ManageShortIncreasePosition(short.id)),
					},
					{
						name: ShortingTab.DecreasePosition,
						label: t(
							`shorting.history.manage-short.sections.${ShortingTab.DecreasePosition}.nav-title`
						),
						active: activeTab === ShortingTab.DecreasePosition,
						onClick: () => router.push(ROUTES.Shorting.ManageShortDecreasePosition(short.id)),
					},
					{
						isClosePosition: true,
						name: ShortingTab.ClosePosition,
						label: t(
							`shorting.history.manage-short.sections.${ShortingTab.ClosePosition}.nav-title`
						),
						active: activeTab === ShortingTab.ClosePosition,
						onClick: () => router.push(ROUTES.Shorting.ManageShortClosePosition(short.id)),
					},
			  ]
			: [];
	}, [t, activeTab, router, short?.id]);

	const leftTabs = useMemo(() => TABS.filter((tab) => !tab.isClosePosition), [TABS]);
	const closeTab = useMemo(() => TABS.find((tab) => tab.isClosePosition), [TABS]);

	const nextInteractionDate = useMemo(
		() =>
			short != null
				? add(short.lastInteraction, { seconds: collateralShortInfo?.interactionDelay })
				: null,
		[short, collateralShortInfo?.interactionDelay]
	);

	const interactionDisabled = useMemo(() => {
		if (nextInteractionDate != null) {
			return isAfter(nextInteractionDate, new Date());
		}
		return false;
	}, [nextInteractionDate]);

	useEffect(() => {
		if (short == null && shortPositionQuery.isError) {
			router.push(ROUTES.Shorting.Home);
		}
	}, [short, shortPositionQuery, router]);

	useEffect(() => {
		setInputAmount('');
	}, [activeTab]);

	return (
		<Container>
			{short == null ? (
				shortPositionQuery.isLoading && <Loader />
			) : (
				<>
					<IconButton onClick={() => router.push(ROUTES.Shorting.Home)}>
						<StyledBackIcon src={BackIcon} viewBox={`0 0 ${BackIcon.width} ${BackIcon.height}`} />
					</IconButton>
					<ManageShortTitle>
						{t('shorting.history.manage-short.title', { loanId: short.id })}
					</ManageShortTitle>
					<PositionCard short={short} inputAmount={inputAmount} activeTab={activeTab} />
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
									{closeTab.label}
								</CloseTabButton>
							) : null}
						</StyledTabList>
					</FlexDivRow>
					<TabsContainer>
						<TabPanelsContainer interactionDisabled={interactionDisabled}>
							{TABS.map(({ name }) => (
								<TabPanel key={name} name={name} activeTab={activeTab}>
									<ManageShortAction
										tab={name}
										isActive={name === activeTab}
										short={short}
										refetchShortPosition={() => shortPositionQuery.refetch()}
										setInputAmount={setInputAmount}
										inputAmount={inputAmount}
									/>
								</TabPanel>
							))}
						</TabPanelsContainer>
						{interactionDisabled && nextInteractionDate != null && (
							<CenteredMessage>
								<div>{t('shorting.history.manage-short.interaction-disabled.title')}</div>
								<div>
									{t('shorting.history.manage-short.interaction-disabled.message.part1')}{' '}
									<Countdown
										date={nextInteractionDate}
										renderer={({ minutes, seconds }) => {
											const duration = [
												`${zeroPad(minutes)}${t('common.time.minutes')}`,
												`${zeroPad(seconds)}${t('common.time.seconds')}`,
											];

											return <span>{duration.join(':')}</span>;
										}}
									/>{' '}
									{t('shorting.history.manage-short.interaction-disabled.message.part2')}
								</div>
							</CenteredMessage>
						)}
					</TabsContainer>
				</>
			)}
		</Container>
	);
};

const Container = styled.div``;

const StyledTabButton = styled(TabButton)``;

const CloseTabButton = styled(TabButton)<{ active: boolean }>`
	color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.red)};
	margin-left: auto;
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

const TabsContainer = styled.div`
	position: relative;
`;

const TabPanelsContainer = styled.div<{ interactionDisabled: boolean }>`
	${(props) =>
		props.interactionDisabled &&
		css`
			pointer-events: none;
			opacity: 0.2;
			user-select: none;
		`}
`;

export default ManageShort;
