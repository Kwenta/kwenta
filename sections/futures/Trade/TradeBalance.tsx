import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg';
import PencilIcon from 'assets/svg/app/pencil.svg';
import HelpIcon from 'assets/svg/app/question-mark.svg';
import Button from 'components/Button';
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex';
import Pill from 'components/Pill';
import { Body, NumericValue } from 'components/Text';
import Tooltip from 'components/Tooltip/Tooltip';
import { MIN_MARGIN_AMOUNT } from 'constants/futures';
import { setOpenModal } from 'state/app/reducer';
import { selectShowModal } from 'state/app/selectors';
import { selectSusdBalance } from 'state/balances/selectors';
import {
	selectAvailableMargin,
	selectFuturesType,
	selectIdleMargin,
	selectLockedMarginInMarkets,
	selectWithdrawableMargin,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';

import CrossMarginInfoBox from '../TradeCrossMargin/CrossMarginInfoBox';
import SmartMarginOnboardModal from './SmartMarginOnboardModal';

type TradeBalanceProps = {
	isMobile?: boolean;
};

const TradeBalance: React.FC<TradeBalanceProps> = memo(({ isMobile = false }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const theme = useTheme();

	const idleMargin = useAppSelector(selectIdleMargin);
	const lockedMargin = useAppSelector(selectLockedMarginInMarkets);
	const walletBal = useAppSelector(selectSusdBalance);
	const accountType = useAppSelector(selectFuturesType);
	const availableIsolatedMargin = useAppSelector(selectAvailableMargin);
	const withdrawable = useAppSelector(selectWithdrawableMargin);
	const openModal = useAppSelector(selectShowModal);

	const [expanded, setExpanded] = useState(false);

	const isDepositRequired = useMemo(() => {
		return walletBal.lt(MIN_MARGIN_AMOUNT) && withdrawable.eq(0);
	}, [walletBal, withdrawable]);

	const onClickContainer = () => {
		if (accountType === 'isolated_margin') return;
		setExpanded(!expanded);
	};

	return (
		<Container>
			<BalanceContainer
				clickable={accountType === 'cross_margin'}
				onClick={!isMobile ? onClickContainer : undefined}
			>
				{accountType === 'cross_margin' && isDepositRequired ? (
					<DepositContainer>
						<FlexDivCol>
							<FlexDivRow columnGap="5px" justifyContent="flex-start">
								<Body size={isMobile ? 'small' : 'medium'} color="secondary">
									{t('futures.market.trade.trade-balance.no-available-margin')}
								</Body>
								{expanded ? <HideIcon /> : <ExpandIcon />}
							</FlexDivRow>
							<Body size={isMobile ? 'small' : 'medium'} color="preview">
								{t('futures.market.trade.trade-balance.min-margin')}
							</Body>
						</FlexDivCol>
						<Button
							variant="yellow"
							size="xsmall"
							textTransform="none"
							onClick={() => dispatch(setOpenModal('futures_smart_margin_socket'))}
						>
							{t('header.balance.get-susd')}
						</Button>
					</DepositContainer>
				) : (
					<>
						{isMobile ? (
							<FlexDivCol rowGap="5px">
								<FlexDivRow style={{ width: '200px' }}>
									<Body size={'medium'} color="secondary">
										{t('futures.market.trade.trade-balance.available-margin')}:
									</Body>
									<NumericValue size={'medium'} weight="bold">
										{accountType === 'isolated_margin'
											? formatDollars(availableIsolatedMargin)
											: formatDollars(idleMargin)}
									</NumericValue>
								</FlexDivRow>
								{accountType === 'cross_margin' && lockedMargin.gt(0) && (
									<FlexDivRow style={{ width: '200px' }}>
										<Body size={'medium'} color="secondary">
											{t('futures.market.trade.trade-balance.locked-margin')}:
										</Body>
										<FlexDivRowCentered columnGap="5px">
											<NumericValue size={'medium'} weight="bold" color="secondary">
												{formatDollars(lockedMargin)}
											</NumericValue>
											<Tooltip
												position="fixed"
												content={t('futures.market.trade.trade-balance.tooltip')}
												width="200px !important"
											>
												<HelpIcon />
											</Tooltip>
										</FlexDivRowCentered>
									</FlexDivRow>
								)}
							</FlexDivCol>
						) : (
							<FlexDivRow columnGap="10px" justifyContent="flex-start">
								<FlexDivCol>
									<Body size={'medium'} color="secondary">
										{t('futures.market.trade.trade-balance.available-margin')}
									</Body>
									<NumericValue size={'large'} weight="bold">
										{accountType === 'isolated_margin'
											? formatDollars(availableIsolatedMargin)
											: formatDollars(idleMargin)}
									</NumericValue>
								</FlexDivCol>
								{accountType === 'cross_margin' && lockedMargin.gt(0) && (
									<StyledFlexDivCol>
										<FlexDivRowCentered columnGap="5px">
											<Body size={'medium'} color="secondary">
												{t('futures.market.trade.trade-balance.locked-margin')}
											</Body>
											<Tooltip
												position="fixed"
												content={t('futures.market.trade.trade-balance.tooltip')}
												width="280px"
											>
												<HelpIcon />
											</Tooltip>
										</FlexDivRowCentered>
										<NumericValue size={'large'} weight="bold" color="secondary">
											{formatDollars(lockedMargin)}
										</NumericValue>
									</StyledFlexDivCol>
								)}
							</FlexDivRow>
						)}
					</>
				)}

				{(accountType === 'isolated_margin' || withdrawable.gt(0) || !isDepositRequired) && (
					<FlexDivRowCentered columnGap="15px">
						<PencilIcon
							fill={theme.colors.selectedTheme.newTheme.text.preview}
							width={16}
							height={16}
							onClick={() =>
								dispatch(
									setOpenModal(
										accountType === 'isolated_margin'
											? 'futures_isolated_transfer'
											: 'futures_cross_withdraw'
									)
								)
							}
						/>
						{expanded ? (
							<Pill roundedCorner={false} onClick={onClickContainer}>
								<HideIcon />
							</Pill>
						) : (
							<Pill roundedCorner={false} onClick={onClickContainer}>
								<ExpandIcon />
							</Pill>
						)}
					</FlexDivRowCentered>
				)}
			</BalanceContainer>

			{expanded && accountType === 'cross_margin' && (
				<DetailsContainer>{<CrossMarginInfoBox />}</DetailsContainer>
			)}
			{openModal === 'futures_smart_margin_socket' && (
				<SmartMarginOnboardModal
					onDismiss={() => {
						dispatch(setOpenModal(null));
					}}
				/>
			)}
		</Container>
	);
});

const DepositContainer = styled(FlexDivRowCentered)`
	width: 100%;
`;

const StyledFlexDivCol = styled(FlexDivCol)`
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
	padding-left: 10px;
`;

const Container = styled.div`
	width: 100%;
	padding: 13px 15px;
`;

const BalanceContainer = styled(FlexDivRowCentered)<{ clickable: boolean }>`
	cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
	width: 100%;
`;

const DetailsContainer = styled.div`
	margin-top: 15px;
`;

const ExpandIcon = styled(CaretDownIcon)``;

const HideIcon = styled(CaretDownIcon)`
	transform: scaleY(-1);
	margin-top: 4px;
`;

export default TradeBalance;
