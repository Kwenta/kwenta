import { wei } from '@synthetixio/wei';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import Loader from 'components/Loader';
import Spacer from 'components/Spacer';
import { NumberSpan } from 'components/Text/NumberLabel';
import { DEFAULT_LEVERAGE } from 'constants/defaults';
import { useFuturesContext } from 'contexts/FuturesContext';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import { ORDER_PREVIEW_ERRORS_I18N, previewErrorI18n } from 'queries/futures/constants';
import {
	crossMarginTotalMarginState,
	currentMarketState,
	marketInfoState,
	orderTypeState,
	positionState,
	potentialTradeDetailsState,
	preferredLeverageState,
	tradeFeesState,
} from 'store/futures';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { isUserDeniedError } from 'utils/formatters/error';
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
	const { handleRefetch, refetchUntilUpdate } = useRefetchContext();
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
	const { error: previewError, data: previewData } = useRecoilValue(potentialTradeDetailsState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);

	const [preferredLeverage, setPreferredLeverage] = usePersistedRecoilState(preferredLeverageState);

	const [leverage, setLeverage] = useState<number>(Number(Number(selectedLeverage).toFixed(2)));
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<null | string>(null);

	const maxLeverage = Number((market?.maxLeverage || wei(DEFAULT_LEVERAGE)).toString(2));

	useEffect(() => {
		if (orderType !== 'market') {
			setOrderType('market');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const maxPositionUsd = useMemo(() => {
		return totalMargin.mul(leverage);
	}, [totalMargin, leverage]);

	const handleIncrease = () => {
		let newLeverage = wei(leverage).add(1).toNumber();
		newLeverage = Math.max(newLeverage, 1);
		setLeverage(Math.min(newLeverage, maxLeverage));
		previewPositionChange(newLeverage);
	};

	const handleDecrease = () => {
		let newLeverage = wei(leverage).sub(1).toNumber();
		newLeverage = Math.max(newLeverage, 1);
		setLeverage(newLeverage);
		previewPositionChange(newLeverage);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const previewPositionChange = useCallback(
		debounce((leverage: number) => {
			if (leverage >= 1) {
				onLeverageChange(leverage);
			}
		}, 200),
		[onLeverageChange]
	);

	const onConfirm = useCallback(async () => {
		setError(null);
		if (position?.position) {
			try {
				setSubmitting(true);
				const tx = await submitCrossMarginOrder(true);
				if (tx?.hash) {
					monitorTransaction({
						txHash: tx.hash,
						onTxFailed(failureMessage) {
							setError(failureMessage?.failureReason || t('common.transaction.transaction-failed'));
						},
						onTxConfirmed: () => {
							try {
								resetTradeState();
								handleRefetch('modify-position');
								refetchUntilUpdate('account-margin-change');
								setSubmitting(false);
								onDismiss();
							} catch (err) {
								logError(err);
							}
						},
					});
				}
			} catch (err) {
				setSubmitting(false);
				setError(t('common.transaction.transaction-failed'));
				logError(err);
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
		setPreferredLeverage,
		onLeverageChange,
		submitCrossMarginOrder,
		setError,
		refetchUntilUpdate,
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

	const errorMessage = error || previewError;

	return (
		<StyledBaseModal
			title={t(`futures.market.trade.leverage.modal.title`)}
			isOpen
			onDismiss={onClose}
		>
			<Label>{t('futures.market.trade.leverage.modal.input-label')}:</Label>
			<InputContainer
				dataTestId="futures-market-trade-leverage-modal-input"
				value={String(leverage)}
				onChange={(_, v) => {
					setLeverage(Number(v));
					previewPositionChange(Number(v));
				}}
				right={<MaxButton onClick={handleIncrease}>+</MaxButton>}
				left={<MaxButton onClick={handleDecrease}>-</MaxButton>}
				textAlign="center"
			/>
			<SliderOuter>
				<Spacer height={55} />

				<SliderInner>
					<FlexDivRow>
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
					</FlexDivRow>
				</SliderInner>
			</SliderOuter>

			<MaxPosContainer>
				<Label>{t('futures.market.trade.leverage.modal.max-pos')}</Label>
				<Label>
					<NumberSpan fontWeight="bold">{formatDollars(maxPositionUsd)}</NumberSpan> sUSD
				</Label>
			</MaxPosContainer>

			{position?.position && (
				<>
					<Spacer height={15} />
					<MarginInfoBox editingLeverage />
					{tradeFees.total.gt(0) && <FeeInfoBox />}
				</>
			)}

			<MarginActionButton
				disabled={!!previewError || (!!position?.position && !previewData) || leverage < 1}
				data-testid="futures-market-trade-deposit-margin-button"
				fullWidth
				onClick={onConfirm}
			>
				{submitting ? <Loader /> : t('futures.market.trade.leverage.modal.confirm')}
			</MarginActionButton>

			{errorMessage && !isUserDeniedError(errorMessage) && (
				<>
					<Spacer height={12} />
					<ErrorView
						message={t(
							errorMessage === 'insufficient_margin'
								? ORDER_PREVIEW_ERRORS_I18N.insufficient_margin_edit_leverage
								: previewError
								? previewErrorI18n(errorMessage)
								: t('futures.market.trade.edit-leverage.failed')
						)}
						formatter="revert"
					/>
				</>
			)}
		</StyledBaseModal>
	);
}

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

const MaxPosContainer = styled(FlexDivRowCentered)`
	margin-top: 15px;
	p {
		margin: 0;
	}
`;

const Label = styled.p`
	font-size: 13px;
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
	margin-bottom: 15px;
`;

const SliderOuter = styled.div`
	position: relative;
`;

const SliderInner = styled.div`
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
`;
