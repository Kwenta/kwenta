import { wei } from '@synthetixio/wei';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import Loader from 'components/Loader';
import { NumberSpan } from 'components/Text/NumberLabel';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useFuturesContext } from 'contexts/FuturesContext';
import { useRefetchContext } from 'contexts/RefetchContext';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import {
	crossMarginTotalMarginState,
	currentMarketState,
	marketInfoState,
	positionState,
	preferredLeverageState,
	tradeFeesState,
} from 'store/futures';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatDollars } from 'utils/formatters/number';
import logError from 'utils/logError';

import FeeInfoBox from '../FeeInfoBox';
import LeverageSlider from '../LeverageSlider';
import MarginInfoBox from './CrossMarginInfoBox';

type DepositMarginModalProps = {
	onDismiss(): void;
};

export default function EditLeverageModal({ onDismiss }: DepositMarginModalProps) {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { handleRefetch } = useRefetchContext();
	const {
		selectedLeverage,
		onLeverageChange,
		resetTradeState,
		submitCrossMarginOrder,
	} = useFuturesContext();

	const market = useRecoilValue(marketInfoState);
	const position = useRecoilValue(positionState);
	const marketAsset = useRecoilValue(currentMarketState);
	const totalMargin = useRecoilValue(crossMarginTotalMarginState);
	const tradeFees = useRecoilValue(tradeFeesState);

	const [preferredLeverage, setPreferredLeverage] = usePersistedRecoilState(preferredLeverageState);

	const [leverage, setLeverage] = useState<number>(Number(Number(selectedLeverage).toFixed(2)));
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<null | string>(null);

	const maxLeverage = Number((market?.maxLeverage || wei(10)).toString(2));

	const maxPositionUsd = useMemo(() => {
		return totalMargin.mul(leverage);
	}, [totalMargin, leverage]);

	const handleIncrease = () => {
		const newLeverage = Math.max(leverage + 1, 1);
		setLeverage(Math.min(newLeverage, maxLeverage));
		previewPositionChange(newLeverage);
	};

	const handleDecrease = () => {
		const newLeverage = Math.max(leverage - 1, 1);
		setLeverage(newLeverage);
		previewPositionChange(newLeverage);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const previewPositionChange = useCallback(
		debounce((leverage: number) => {
			onLeverageChange(leverage);
		}, 200),
		[onLeverageChange]
	);

	const onConfirm = useCallback(async () => {
		if (position?.position) {
			try {
				setSubmitting(true);
				const tx = await submitCrossMarginOrder();
				if (tx?.hash) {
					monitorTransaction({
						txHash: tx.hash,
						onTxFailed(failureMessage) {
							setError(failureMessage?.failureReason || t('common.transaction.transaction-failed'));
						},
						onTxConfirmed: () => {
							resetTradeState();
							handleRefetch('modify-position');
							onDismiss();
						},
					});
				}
			} catch (err) {
				logError(err);
			} finally {
				setSubmitting(false);
			}
			resetTradeState();
		} else {
			onLeverageChange(leverage);
			setPreferredLeverage({
				...preferredLeverage,
				[marketAsset]: String(leverage),
			});
			onDismiss();
		}
	}, [
		marketAsset,
		leverage,
		position?.position,
		preferredLeverage,
		setSubmitting,
		resetTradeState,
		t,
		monitorTransaction,
		setPreferredLeverage,
		onLeverageChange,
		submitCrossMarginOrder,
		setError,
		handleRefetch,
		onDismiss,
	]);

	const onClose = () => {
		if (position?.position) {
			resetTradeState();
		}
		onDismiss();
	};

	useEffect(() => {
		if (position?.position) {
			// Clear size inputs on mount if there is a position open
			resetTradeState();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<StyledBaseModal
			title={t(`futures.market.trade.leverage.modal.title`)}
			isOpen
			onDismiss={onClose}
		>
			<Label>{t('futures.market.trade.leverage.modal.input-label')}:</Label>
			<InputContainer
				dataTestId="futures-market-trade-leverage-modal-input"
				value={leverage}
				onChange={(_, v) => {
					setLeverage(Number(v));
					previewPositionChange(Number(v));
				}}
				right={<MaxButton onClick={handleIncrease}>+</MaxButton>}
				left={<MaxButton onClick={handleDecrease}>-</MaxButton>}
				textAlign="center"
			/>

			<SliderRow>
				<LeverageSlider
					minValue={1}
					maxValue={maxLeverage}
					value={leverage}
					onChange={(_, newValue) => {
						setLeverage(newValue as number);
						previewPositionChange(newValue as number);
					}}
					onChangeCommitted={() => {}}
				/>
			</SliderRow>

			<MaxPosContainer>
				<Label>{t('futures.market.trade.leverage.modal.max-pos')}</Label>
				<Label>
					<NumberSpan fontWeight="bold">{formatDollars(maxPositionUsd)}</NumberSpan> sUSD
				</Label>
			</MaxPosContainer>

			{position?.position && (
				<>
					<MarginInfoBox editingLeverage />
					{tradeFees.total.gt(0) && <FeeInfoBox />}
				</>
			)}

			<MarginActionButton
				data-testid="futures-market-trade-deposit-margin-button"
				fullWidth
				onClick={onConfirm}
			>
				{submitting ? <Loader /> : t('futures.market.trade.leverage.modal.confirm')}
			</MarginActionButton>

			{error && <ErrorView message={error} formatter="revert" />}
		</StyledBaseModal>
	);
}

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

const MaxPosContainer = styled(FlexDivRowCentered)`
	margin-top: 24px;
	margin-bottom: 8px;
	p {
		margin: 0;
	}
`;

const Label = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const MarginActionButton = styled(Button)`
	margin-top: 16px;
	height: 55px;
	font-size: 15px;
`;

const MaxButton = styled.div`
	padding: 4px 10px;
	font-size: 18px;
	font-weight: 400;
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	cursor: pointer;
`;

const InputContainer = styled(CustomInput)`
	margin-bottom: 30px;
`;

const SliderRow = styled(FlexDivRow)`
	margin-bottom: 14px;
	position: relative;
`;
