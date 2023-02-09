import { wei } from '@synthetixio/wei';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivRow, FlexDivRowCentered } from 'components/layout/flex';
import Loader from 'components/Loader';
import Spacer from 'components/Spacer';
import { NumberDiv } from 'components/Text/NumberLabel';
import { useFuturesContext } from 'contexts/FuturesContext';
import { ORDER_PREVIEW_ERRORS_I18N, previewErrorI18n } from 'queries/futures/constants';
import { setOpenModal } from 'state/app/reducer';
import {
	editExistingPositionLeverage,
	editCrossMarginSize,
	setCrossMarginLeverage,
	submitCrossMarginOrder,
} from 'state/futures/actions';
import { setOrderType as setReduxOrderType } from 'state/futures/reducer';
import {
	selectCrossMarginBalanceInfo,
	selectCrossMarginSelectedLeverage,
	selectCrossMarginTradeFees,
	selectMaxLeverage,
	selectOrderType,
	selectPosition,
	selectSubmittingFuturesTx,
	selectTradePreview,
	selectTradePreviewError,
} from 'state/futures/selectors';
import { useAppSelector, useAppDispatch } from 'state/hooks';
import { isUserDeniedError } from 'utils/formatters/error';
import { formatDollars, zeroBN } from 'utils/formatters/number';

import FeeInfoBox from '../FeeInfoBox';
import LeverageSlider from '../LeverageSlider';
import MarginInfoBox from './CrossMarginInfoBox';

type DepositMarginModalProps = {
	editMode: 'existing_position' | 'new_position';
};

export default function EditLeverageModal({ editMode }: DepositMarginModalProps) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { resetTradeState } = useFuturesContext();

	const onLeverageChange = useCallback(
		(leverage: number) => {
			dispatch(setCrossMarginLeverage(String(leverage)));
			dispatch(editCrossMarginSize('', 'usd'));
		},
		[dispatch]
	);

	const balanceInfo = useAppSelector(selectCrossMarginBalanceInfo);
	const position = useAppSelector(selectPosition);
	const tradeFees = useAppSelector(selectCrossMarginTradeFees);
	const previewData = useAppSelector(selectTradePreview);
	const previewError = useAppSelector(selectTradePreviewError);
	const orderType = useAppSelector(selectOrderType);
	const selectedLeverage = useAppSelector(selectCrossMarginSelectedLeverage);
	const submitting = useAppSelector(selectSubmittingFuturesTx);
	const maxLeverage = useAppSelector(selectMaxLeverage);

	const [leverage, setLeverage] = useState<number>(
		editMode === 'existing_position' && position?.position
			? Number(position.position.leverage.toNumber().toFixed(2))
			: Number(Number(selectedLeverage).toFixed(2))
	);

	const totalMargin = useMemo(() => {
		return position?.remainingMargin.add(balanceInfo.freeMargin) ?? zeroBN;
	}, [position?.remainingMargin, balanceInfo.freeMargin]);

	const maxLeverageNum = useMemo(() => Number(maxLeverage.toString(2)), [maxLeverage]);

	useEffect(() => {
		if (editMode === 'existing_position' && orderType !== 'market') {
			dispatch(setReduxOrderType('market'));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const maxPositionUsd = useMemo(() => {
		return totalMargin.mul(leverage);
	}, [totalMargin, leverage]);

	const handleIncrease = () => {
		let newLeverage = wei(leverage).add(1).toNumber();
		newLeverage = Math.max(newLeverage, 1);
		setLeverage(Math.min(newLeverage, maxLeverageNum));
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
				editMode === 'existing_position'
					? dispatch(editExistingPositionLeverage(String(leverage)))
					: onLeverageChange(leverage);
			}
		}, 200),
		[onLeverageChange]
	);

	const onConfirm = useCallback(async () => {
		if (editMode === 'existing_position') {
			dispatch(submitCrossMarginOrder());
		} else {
			dispatch(setOpenModal(null));
		}
	}, [dispatch, editMode]);

	const onClose = useCallback(() => {
		if (position?.position) {
			resetTradeState();
		}
		dispatch(setOpenModal(null));
	}, [dispatch, position?.position, resetTradeState]);

	useEffect(() => {
		if (position?.position) {
			// Clear size inputs on mount if there is a position open
			resetTradeState();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const errorMessage = useMemo(
		() => previewError || (previewData?.showStatus && previewData?.statusMessage),
		[previewError, previewData?.showStatus, previewData?.statusMessage]
	);

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
					const nextLeverage = Math.min(Number(v), maxLeverageNum);
					setLeverage(nextLeverage);
					previewPositionChange(nextLeverage);
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
							maxValue={maxLeverageNum}
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

			{editMode === 'new_position' && (
				<MaxPosContainer>
					<Label>{t('futures.market.trade.leverage.modal.max-pos')}</Label>
					<Label>
						<NumberDiv as="span" fontWeight="bold">
							{formatDollars(maxPositionUsd)}
						</NumberDiv>{' '}
						sUSD
					</Label>
				</MaxPosContainer>
			)}

			{position?.position && editMode === 'existing_position' && (
				<>
					<Spacer height={15} />
					<MarginInfoBox editingLeverage />
					{tradeFees.total.gt(0) && <FeeInfoBox />}
				</>
			)}

			<MarginActionButton
				disabled={
					!!previewError ||
					(editMode === 'existing_position' && (!previewData || !!errorMessage)) ||
					leverage < 1
				}
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
						message={t(getStatusMessageI18n(errorMessage, previewError))}
						formatter="revert"
					/>
				</>
			)}
		</StyledBaseModal>
	);
}

// TODO: Clean up preview error messaging

const getStatusMessageI18n = (message: string, previewError: string | null | undefined) => {
	if (message === 'insufficient_margin' || message === 'Insufficient margin') {
		return ORDER_PREVIEW_ERRORS_I18N.insufficient_margin_edit_leverage;
	} else if (message === 'insufficient_free_margin' || message === 'Insufficient free margin') {
		return ORDER_PREVIEW_ERRORS_I18N.insufficient_free_margin_edit_leverage;
	}
	if (previewError) return previewErrorI18n(previewError);
	return 'futures.market.trade.edit-leverage.failed';
};

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

const InputContainer = styled(NumericInput)`
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
