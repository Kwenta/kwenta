import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg';
import Button from 'components/Button';
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex';
import { Body, NumericValue } from 'components/Text';
import { MIN_MARGIN_AMOUNT } from 'constants/futures';
import { setOpenModal } from 'state/app/reducer';
import { selectShowModal } from 'state/app/selectors';
import { selectSusdBalance } from 'state/balances/selectors';
import {
	selectAvailableMargin,
	selectFuturesType,
	selectIdleMargin,
	selectWithdrawableMargin,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars, zeroBN } from 'utils/formatters/number';

import CrossMarginInfoBox from '../TradeCrossMargin/CrossMarginInfoBox';
import TransferIsolatedMarginModal from './TransferIsolatedMarginModal';

type TradeBalanceProps = {
	isMobile?: boolean;
};

const TradeBalance: React.FC<TradeBalanceProps> = memo(({ isMobile = false }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const idleMargin = useAppSelector(selectIdleMargin);
	const accountType = useAppSelector(selectFuturesType);
	const availableIsolatedMargin = useAppSelector(selectAvailableMargin);
	const withdrawable = useAppSelector(selectWithdrawableMargin);
	const susdBalance = useAppSelector(selectSusdBalance);
	const openModal = useAppSelector(selectShowModal);

	const [expanded, setExpanded] = useState(false);

	const minDeposit = useMemo(() => {
		const min = MIN_MARGIN_AMOUNT.sub(idleMargin);
		return min.lt(zeroBN) ? zeroBN : min;
	}, [idleMargin]);

	const isDepositRequired = useMemo(() => susdBalance.lt(minDeposit), [minDeposit, susdBalance]);

	const onClickContainer = () => {
		if (accountType === 'isolated_margin' || isDepositRequired) return;
		setExpanded(!expanded);
	};

	return (
		<Container>
			<FlexDivRowCentered>
				<BalanceContainer clickable={accountType === 'cross_margin'} onClick={onClickContainer}>
					{isDepositRequired ? (
						<FlexDivRowCentered>
							<FlexDivCol>
								<Body size={isMobile ? 'small' : 'medium'} color="secondary">
									No available margin:
								</Body>
								<Body size={isMobile ? 'small' : 'medium'} color="preview">
									Min.$50 sUSD required to trade on Kwenta
								</Body>
							</FlexDivCol>
							<Button
								variant="yellow"
								size="xsmall"
								textTransform="none"
								onClick={() => dispatch(setOpenModal('futures_isolated_transfer'))}
							>
								{t('header.balance.get-susd')}
							</Button>
						</FlexDivRowCentered>
					) : (
						<FlexDivRowCentered>
							<FlexDivCol>
								<Body size={isMobile ? 'medium' : 'large'} color="secondary">
									Available Margin
									{accountType === 'cross_margin' ? expanded ? <HideIcon /> : <ExpandIcon /> : null}
								</Body>
								<NumericValue size={isMobile ? 'medium' : 'large'} weight="bold">
									{accountType === 'isolated_margin'
										? formatDollars(availableIsolatedMargin)
										: formatDollars(idleMargin)}
								</NumericValue>
							</FlexDivCol>
							{(accountType === 'isolated_margin' || withdrawable.gt(0) || !isDepositRequired) && (
								<Button
									onClick={() =>
										dispatch(
											setOpenModal(
												accountType === 'isolated_margin'
													? 'futures_isolated_transfer'
													: 'futures_cross_withdraw'
											)
										)
									}
									size="xsmall"
								>
									Manage
								</Button>
							)}
						</FlexDivRowCentered>
					)}
				</BalanceContainer>
			</FlexDivRowCentered>

			{expanded && accountType === 'cross_margin' && (
				<DetailsContainer>{<CrossMarginInfoBox />}</DetailsContainer>
			)}
			{openModal === 'futures_isolated_transfer' && (
				<TransferIsolatedMarginModal
					defaultTab="deposit"
					onDismiss={() => dispatch(setOpenModal(null))}
				/>
			)}
		</Container>
	);
});

const Container = styled.div`
	width: 100%;
	padding: 13px 15px;
`;

const BalanceContainer = styled.div<{ clickable: boolean }>`
	cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
	width: 100%;
`;

const DetailsContainer = styled.div`
	margin-top: 15px;
`;

const ExpandIcon = styled(CaretDownIcon)`
	margin-left: 8px;
`;

const HideIcon = styled(ExpandIcon)`
	transform: rotate(180deg);
	margin-bottom: -4px;
`;

export default TradeBalance;
