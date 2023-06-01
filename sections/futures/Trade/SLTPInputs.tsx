import { wei } from '@synthetixio/wei';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import InputHeaderRow from 'components/Input/InputHeaderRow';
import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivRow } from 'components/layout/flex';
import { StyledCaretDownIcon } from 'components/Select/Select';
import SelectorButtons from 'components/SelectorButtons/SelectorButtons';
import Spacer from 'components/Spacer';
import { suggestedDecimals } from 'sdk/utils/number';
import { selectAckedOrdersWarning } from 'state/app/selectors';
import { setCrossMarginTradeStopLoss, setCrossMarginTradeTakeProfit } from 'state/futures/reducer';
import {
	selectLeverageInput,
	selectLeverageSide,
	selectMarketPrice,
	selectSlTpTradeInputs,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import OrderAcknowledgement from './OrderAcknowledgement';

const TP_OPTIONS = ['5%', '10%', '25%', '50%', '100%'];
const SL_OPTIONS = ['2%', '5%', '10%', '20%', '50%'];

export default function SLTPInputs() {
	const dispatch = useAppDispatch();
	const { takeProfitPrice, stopLossPrice } = useAppSelector(selectSlTpTradeInputs);
	const currentPrice = useAppSelector(selectMarketPrice);
	const leverageSide = useAppSelector(selectLeverageSide);
	const leverage = useAppSelector(selectLeverageInput);
	const hideWarning = useAppSelector(selectAckedOrdersWarning);

	const [showInputs, setShowInputs] = useState(false);
	const [showOrderWarning, setShowOrderWarning] = useState(false);

	useEffect(() => {
		if (hideWarning) return;
		if (showInputs) {
			setShowOrderWarning(true);
		} else {
			setShowOrderWarning(false);
		}
	}, [showInputs, hideWarning]);

	const leverageWei = useMemo(() => {
		return leverage && Number(leverage) > 0 ? wei(leverage) : wei(1);
	}, [leverage]);

	const onSelectStopLossPercent = useCallback(
		(index) => {
			const option = SL_OPTIONS[index];
			const percent = Math.abs(Number(option.replace('%', ''))) / 100;
			const relativePercent = wei(percent).div(leverageWei);
			const stopLoss =
				leverageSide === 'short'
					? currentPrice.add(currentPrice.mul(relativePercent))
					: currentPrice.sub(currentPrice.mul(relativePercent));
			const dp = suggestedDecimals(stopLoss);
			dispatch(setCrossMarginTradeStopLoss(stopLoss.toString(dp)));
		},
		[currentPrice, dispatch, leverageSide, leverageWei]
	);

	const onSelectTakeProfit = useCallback(
		(index) => {
			const option = TP_OPTIONS[index];
			const percent = Math.abs(Number(option.replace('%', ''))) / 100;
			const relativePercent = wei(percent).div(leverageWei);
			const takeProfit =
				leverageSide === 'short'
					? currentPrice.sub(currentPrice.mul(relativePercent))
					: currentPrice.add(currentPrice.mul(relativePercent));
			const dp = suggestedDecimals(takeProfit);
			dispatch(setCrossMarginTradeTakeProfit(takeProfit.toString(dp)));
		},
		[currentPrice, dispatch, leverageSide, leverageWei]
	);

	const onChangeStopLoss = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setCrossMarginTradeStopLoss(v));
		},
		[dispatch]
	);

	const onChangeTakeProfit = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setCrossMarginTradeTakeProfit(v));
		},
		[dispatch]
	);

	const slInvalid = useMemo(() => {
		if (leverageSide === 'long') {
			return !!stopLossPrice && wei(stopLossPrice || 0).gt(currentPrice);
		} else {
			return !!stopLossPrice && wei(stopLossPrice || 0).lt(currentPrice);
		}
	}, [stopLossPrice, currentPrice, leverageSide]);

	const tpInvalid = useMemo(() => {
		if (leverageSide === 'long') {
			return !!takeProfitPrice && wei(takeProfitPrice || 0).lt(currentPrice);
		} else {
			return !!takeProfitPrice && wei(takeProfitPrice || 0).gt(currentPrice);
		}
	}, [takeProfitPrice, currentPrice, leverageSide]);

	return (
		<Container>
			<ExpandRow onClick={() => setShowInputs(!showInputs)}>
				<InputTitle margin="1px 0 0 0">Stop Loss / Take Profit</InputTitle>
				<Button
					style={{
						height: '20px',
						borderRadius: '4px',
						padding: '3px 5px',
					}}
				>
					<StyledCaretDownIcon style={{ transform: [{ rotateY: '180deg' }] }} $flip={showInputs} />
				</Button>
			</ExpandRow>
			{showInputs ? (
				showOrderWarning ? (
					<WarningContainer>
						<OrderAcknowledgement onClick={() => setShowOrderWarning(false)} />
					</WarningContainer>
				) : (
					<InputsContainer>
						<Spacer height={6} />

						<InputHeaderRow
							label="SL"
							rightElement={
								<SelectorButtons options={SL_OPTIONS} onSelect={onSelectStopLossPercent} />
							}
						/>
						<NumericInput
							invalid={slInvalid}
							dataTestId={'trade-panel-stop-loss-input'}
							value={stopLossPrice}
							placeholder={'0.00'}
							onChange={onChangeStopLoss}
						/>

						<Spacer height={12} />

						<InputHeaderRow
							label="TP"
							rightElement={<SelectorButtons options={TP_OPTIONS} onSelect={onSelectTakeProfit} />}
						/>

						<NumericInput
							invalid={tpInvalid}
							dataTestId={'trade-panel-take-profit-input'}
							value={takeProfitPrice}
							placeholder={'0.00'}
							onChange={onChangeTakeProfit}
						/>
					</InputsContainer>
				)
			) : null}
		</Container>
	);
}

const Container = styled.div`
	padding: 10px;
	background: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.secondary.background};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
	margin-bottom: 16px;
`;

const ExpandRow = styled(FlexDivRow)`
	padding: 0px 2px 0 4px;
	cursor: pointer;
	align-items: center;
`;

const InputsContainer = styled.div`
	padding: 4px;
`;

const WarningContainer = styled.div`
	padding: 10px 0;
`;
