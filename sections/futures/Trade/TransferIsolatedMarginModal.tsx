import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import Error from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import SegmentedControl from 'components/SegmentedControl';
import Spacer from 'components/Spacer';
import { MIN_MARGIN_AMOUNT } from 'constants/futures';
import { NO_VALUE } from 'constants/placeholder';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import { selectMarketAsset, selectPosition } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { gasSpeedState } from 'store/wallet';
import { FlexDivRowCentered } from 'styles/common';
import { formatDollars, zeroBN } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

type Props = {
	onDismiss(): void;
	defaultTab: 'deposit' | 'withdraw';
	sUSDBalance: Wei;
};

const PLACEHOLDER = '$0.00';

const TransferIsolatedMarginModal: React.FC<Props> = ({ onDismiss, sUSDBalance, defaultTab }) => {
	const { t } = useTranslation();
	const { useEthGasPriceQuery, useSynthetixTxn } = useSynthetixQueries();
	const { estimateSnxTxGasCost } = useEstimateGasCost();

	const gasSpeed = useRecoilValue(gasSpeedState);
	const position = useAppSelector(selectPosition);
	const marketAsset = useAppSelector(selectMarketAsset);

	const minDeposit = useMemo(() => {
		const accessibleMargin = position?.accessibleMargin ?? zeroBN;
		const min = MIN_MARGIN_AMOUNT.sub(accessibleMargin);
		return min.lt(zeroBN) ? zeroBN : min;
	}, [position?.accessibleMargin]);

	const [amount, setAmount] = useState('');
	const [transferType, setTransferType] = useState(defaultTab === 'deposit' ? 0 : 1);

	const ethGasPriceQuery = useEthGasPriceQuery();
	const { handleRefetch } = useRefetchContext();
	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : null;

	const susdBal = transferType === 0 ? sUSDBalance : position?.accessibleMargin || zeroBN;
	const accessibleMargin = useMemo(() => position?.accessibleMargin ?? zeroBN, [
		position?.accessibleMargin,
	]);

	const isDisabled = useMemo(() => {
		if (!amount) {
			return true;
		}
		const amtWei = wei(amount);
		if (amtWei.eq(0) || amtWei.gt(susdBal) || (transferType === 0 && amtWei.lt(minDeposit))) {
			return true;
		}
		return false;
	}, [amount, susdBal, minDeposit, transferType]);

	const computedWithdrawAmount = useMemo(
		() =>
			accessibleMargin.eq(wei(amount || 0))
				? accessibleMargin.mul(wei(-1)).toBN()
				: wei(-amount).toBN(),
		[amount, accessibleMargin]
	);

	const depositTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(marketAsset)}`,
		'transferMargin',
		[wei(amount || 0).toBN()],
		gasPrice || undefined,
		{ enabled: !!marketAsset && !!amount && !isDisabled && transferType === 0 }
	);

	const withdrawTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(marketAsset)}`,
		'transferMargin',
		[computedWithdrawAmount],
		gasPrice || undefined,
		{ enabled: !!marketAsset && !!amount && transferType === 1 }
	);

	const transactionFee = estimateSnxTxGasCost(transferType === 0 ? depositTxn : withdrawTxn);

	useEffect(() => {
		const hash = depositTxn.hash ?? withdrawTxn.hash;
		if (hash) {
			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					handleRefetch('margin-change');
					onDismiss();
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [depositTxn.hash, withdrawTxn.hash]);

	const handleSetMax = useCallback(() => {
		if (transferType === 0) {
			setAmount(susdBal.toString());
		} else {
			setAmount(accessibleMargin.toString());
		}
	}, [susdBal, accessibleMargin, transferType]);

	const onChangeTab = (selection: number) => {
		setTransferType(selection);
		setAmount('');
	};

	return (
		<StyledBaseModal
			title={t('futures.market.trade.margin.modal.deposit.title')}
			isOpen
			onDismiss={onDismiss}
		>
			<StyledSegmentedControl
				values={['Deposit', 'Withdraw']}
				selectedIndex={transferType}
				onChange={onChangeTab}
			/>
			<BalanceContainer>
				<BalanceText $gold>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatDollars(susdBal)}</span> sUSD
				</BalanceText>
			</BalanceContainer>
			<CustomInput
				dataTestId="futures-market-trade-deposit-margin-input"
				placeholder={PLACEHOLDER}
				value={amount}
				onChange={(_, v) => setAmount(v)}
				right={
					<MaxButton onClick={handleSetMax}>{t('futures.market.trade.margin.modal.max')}</MaxButton>
				}
			/>
			{transferType === 0 ? (
				<MinimumAmountDisclaimer>
					{t('futures.market.trade.margin.modal.deposit.disclaimer')}
				</MinimumAmountDisclaimer>
			) : (
				<Spacer height={20} />
			)}

			<MarginActionButton
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={isDisabled}
				fullWidth
				onClick={transferType === 0 ? () => depositTxn.mutate() : () => withdrawTxn.mutate()}
			>
				{transferType === 0
					? t('futures.market.trade.margin.modal.deposit.button')
					: t('futures.market.trade.margin.modal.withdraw.button')}
			</MarginActionButton>

			<GasFeeContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.gas-fee')}:</BalanceText>
				<BalanceText>
					<span>
						{transactionFee ? formatDollars(transactionFee, { maxDecimals: 1 }) : NO_VALUE}
					</span>
				</BalanceText>
			</GasFeeContainer>

			{depositTxn.errorMessage && <Error message={depositTxn.errorMessage} formatter="revert" />}
		</StyledBaseModal>
	);
};

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	p {
		margin: 0;
	}
`;

export const BalanceText = styled.p<{ $gold?: boolean }>`
	color: ${(props) =>
		props.$gold ? props.theme.colors.selectedTheme.yellow : props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`;

export const MarginActionButton = styled(Button)`
	height: 55px;
`;

export const MaxButton = styled.button`
	height: 22px;
	padding: 4px 10px;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border-radius: 11px;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	line-height: 13px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	cursor: pointer;
`;

const MinimumAmountDisclaimer = styled.div`
	font-size: 12px;
	margin: 20px 0;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-align: center;
`;

export const GasFeeContainer = styled(FlexDivRowCentered)`
	margin: 13px 0px;
	padding: 0 14px;
	p {
		margin: 0;
	}
`;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

export default TransferIsolatedMarginModal;
