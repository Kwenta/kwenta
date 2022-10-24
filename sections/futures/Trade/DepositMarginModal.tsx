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
import { NO_VALUE } from 'constants/placeholder';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import { currentMarketState, positionState } from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { FlexDivRowCentered } from 'styles/common';
import { formatDollars, zeroBN } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

type DepositMarginModalProps = {
	onDismiss(): void;
	sUSDBalance: Wei;
};

const PLACEHOLDER = '$0.00';
const MIN_MARGIN_AMOUNT = wei('50');

const DepositMarginModal: React.FC<DepositMarginModalProps> = ({ onDismiss, sUSDBalance }) => {
	const { t } = useTranslation();
	const { useEthGasPriceQuery, useSynthetixTxn } = useSynthetixQueries();
	const { estimateSnxTxGasCost } = useEstimateGasCost();

	const gasSpeed = useRecoilValue(gasSpeedState);
	const position = useRecoilValue(positionState);
	const market = useRecoilValue(currentMarketState);

	const minDeposit = useMemo(() => {
		const accessibleMargin = position?.accessibleMargin ?? zeroBN;
		const min = MIN_MARGIN_AMOUNT.sub(accessibleMargin);
		return min.lt(zeroBN) ? zeroBN : min;
	}, [position?.accessibleMargin]);

	const [amount, setAmount] = useState('');

	const ethGasPriceQuery = useEthGasPriceQuery();
	const { handleRefetch } = useRefetchContext();
	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : null;

	const isDisabled = useMemo(() => {
		if (!amount) {
			return true;
		}
		const amtWei = wei(amount);
		if (amtWei.eq(0) || amtWei.gt(sUSDBalance) || amtWei.lt(minDeposit)) {
			return true;
		}
		return false;
	}, [amount, sUSDBalance, minDeposit]);

	const depositTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(market)}`,
		'transferMargin',
		[wei(amount || 0).toBN()],
		gasPrice || undefined,
		{ enabled: !!market && !!amount && !isDisabled }
	);

	const transactionFee = estimateSnxTxGasCost(depositTxn);

	useEffect(() => {
		if (depositTxn.hash) {
			monitorTransaction({
				txHash: depositTxn.hash,
				onTxConfirmed: () => {
					handleRefetch('margin-change');
					onDismiss();
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [depositTxn.hash]);

	const handleSetMax = useCallback(() => {
		setAmount(sUSDBalance.toString());
	}, [sUSDBalance]);

	return (
		<StyledBaseModal
			title={t('futures.market.trade.margin.modal.deposit.title')}
			isOpen
			onDismiss={onDismiss}
		>
			<BalanceContainer>
				<BalanceText $gold>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatDollars(sUSDBalance)}</span> sUSD
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

			<MinimumAmountDisclaimer>
				{t('futures.market.trade.margin.modal.deposit.disclaimer')}
			</MinimumAmountDisclaimer>

			<MarginActionButton
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={isDisabled}
				fullWidth
				onClick={() => depositTxn.mutate()}
			>
				{t('futures.market.trade.margin.modal.deposit.button')}
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

export default DepositMarginModal;
