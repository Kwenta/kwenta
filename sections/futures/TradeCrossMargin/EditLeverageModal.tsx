import { wei } from '@synthetixio/wei';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import { NumberSpan } from 'components/Text/NumberLabel';
import { useFuturesContext } from 'contexts/FuturesContext';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import {
	crossMarginLeverageInputState,
	crossMarginTotalMarginState,
	marketInfoState,
	preferredLeverageState,
} from 'store/futures';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatDollars } from 'utils/formatters/number';

import LeverageSlider from '../LeverageSlider';

type DepositMarginModalProps = {
	onDismiss(): void;
};

export default function EditLeverageModal({ onDismiss }: DepositMarginModalProps) {
	const { t } = useTranslation();
	const { orderTxn, selectedLeverage, onTradeAmountSUSDChange } = useFuturesContext();

	const setCrossMarginLeverage = useSetRecoilState(crossMarginLeverageInputState);
	const market = useRecoilValue(marketInfoState);
	const totalMargin = useRecoilValue(crossMarginTotalMarginState);
	const [_, setPrefferedLeverage] = usePersistedRecoilState(preferredLeverageState);

	const [leverage, setLeverage] = useState<number>(Number(Number(selectedLeverage).toFixed(2)));

	const maxLeverage = Number((market?.maxLeverage || wei(10)).toString(2));

	const maxPositionUsd = useMemo(() => {
		return totalMargin.mul(leverage);
	}, [totalMargin, leverage]);

	const handleIncrease = () => {
		const newLeverage = leverage + 1;
		setLeverage(Math.min(newLeverage, maxLeverage));
	};

	const handleDecrease = () => {
		const newLeverage = leverage - 1;
		setLeverage(Math.max(newLeverage, 1));
	};

	const onConfirm = () => {
		setPrefferedLeverage(String(leverage));
		setCrossMarginLeverage(String(leverage));
		onTradeAmountSUSDChange('');
		onDismiss();
	};

	return (
		<StyledBaseModal
			title={t(`futures.market.trade.leverage.modal.title`)}
			isOpen
			onDismiss={onDismiss}
		>
			<Label>{t('futures.market.trade.leverage.modal.input-label')}:</Label>
			<InputContainer
				dataTestId="futures-market-trade-leverage-modal-input"
				value={leverage}
				onChange={(_, v) => setLeverage(Number(v))}
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

			<MarginActionButton
				data-testid="futures-market-trade-deposit-margin-button"
				fullWidth
				onClick={onConfirm}
			>
				{t('futures.market.trade.leverage.modal.confirm')}
			</MarginActionButton>

			{orderTxn.errorMessage && <ErrorView message={orderTxn.errorMessage} formatter="revert" />}
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
