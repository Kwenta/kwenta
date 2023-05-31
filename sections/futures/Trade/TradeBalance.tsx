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
import SmartMarginOnboardModal from './SmartMarginOnboardModal';

type TradeBalanceProps = {
	isMobile?: boolean;
};

const TradeBalance: React.FC<TradeBalanceProps> = memo(({ isMobile = false }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const idleMargin = useAppSelector(selectIdleMargin);
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
		<Container mobile={isMobile}>
			<FlexDivRowCentered>
				<BalanceContainer clickable={accountType === 'cross_margin'} onClick={onClickContainer}>
					{accountType === 'cross_margin' && isDepositRequired ? (
						<FlexDivRowCentered>
							<FlexDivCol>
								<Body size={isMobile ? 'small' : 'medium'} color="secondary">
									No available margin
									{expanded ? <HideIcon /> : <ExpandIcon />}
								</Body>
								<Body size={isMobile ? 'small' : 'medium'} color="preview">
									Min. $50 sUSD required to trade
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
						</FlexDivRowCentered>
					) : (
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
					)}
				</BalanceContainer>
				{(accountType === 'isolated_margin' || withdrawable.gt(zeroBN)) && (
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

const Container = styled.div<{ mobile: boolean }>`
	width: 100%;
	padding: 13px 15px;
	border-bottom: ${(props) => (props.mobile ? props.theme.colors.selectedTheme.border : 0)};
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
