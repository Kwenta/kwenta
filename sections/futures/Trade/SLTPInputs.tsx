import { wei } from '@synthetixio/wei';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivRow } from 'components/layout/flex';
import { StyledCaretDownIcon } from 'components/Select/Select';
import SelectorButtons from 'components/SelectorButtons/SelectorButtons';
import Spacer from 'components/Spacer';
import { Body } from 'components/Text';
import { setCrossMarginTradeStopLoss, setCrossMarginTradeTakeProfit } from 'state/futures/reducer';
import {
	selectLeverageSide,
	selectMarketPrice,
	selectStopLossOrder,
	selectTakeProfitOrder,
	selectSlTpTradeInputs,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { suggestedDecimals } from 'utils/formatters/number';

const TP_OPTIONS = ['5%', '10%', '25%', '50%', '100%'];
const SL_OPTIONS = ['2%', '5%', '10%', '20%', '50%'];

export default function SLTPInputs() {
	const dispatch = useAppDispatch();
	const { takeProfitPrice, stopLossPrice } = useAppSelector(selectSlTpTradeInputs);
	const currentPrice = useAppSelector(selectMarketPrice);
	const leverageSide = useAppSelector(selectLeverageSide);
	const pendingStopLoss = useAppSelector(selectStopLossOrder);
	const pendingTakeProfit = useAppSelector(selectTakeProfitOrder);

	const [showInputs, setShowInputs] = useState(false);

	const onSelectStopLossPercent = useCallback(
		(index) => {
			const option = SL_OPTIONS[index];
			const percent = Math.abs(Number(option.replace('%', ''))) / 100;
			const stopLoss =
				leverageSide === 'short'
					? currentPrice.add(currentPrice.mul(percent))
					: currentPrice.sub(currentPrice.mul(percent));
			const dp = suggestedDecimals(stopLoss);
			dispatch(setCrossMarginTradeStopLoss(stopLoss.toString(dp)));
		},
		[currentPrice, dispatch, leverageSide]
	);

	const onSelectTakeProfit = useCallback(
		(index) => {
			const option = TP_OPTIONS[index];
			const percent = Math.abs(Number(option.replace('%', ''))) / 100;
			const takeProfit =
				leverageSide === 'short'
					? currentPrice.sub(currentPrice.mul(percent))
					: currentPrice.add(currentPrice.mul(percent));
			const dp = suggestedDecimals(takeProfit);
			dispatch(setCrossMarginTradeTakeProfit(takeProfit.toString(dp)));
		},
		[currentPrice, dispatch, leverageSide]
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
			return !!stopLossPrice && wei(stopLossPrice).gt(currentPrice);
		} else {
			return !!stopLossPrice && wei(stopLossPrice).lt(currentPrice);
		}
	}, [stopLossPrice, currentPrice, leverageSide]);

	const tpInvalid = useMemo(() => {
		if (leverageSide === 'long') {
			return !!takeProfitPrice && wei(takeProfitPrice).lt(currentPrice);
		} else {
			return !!takeProfitPrice && wei(takeProfitPrice).gt(currentPrice);
		}
	}, [takeProfitPrice, currentPrice, leverageSide]);

	return (
		<Container>
			<ExpandRow onClick={() => setShowInputs(!showInputs)}>
				<Title>Stop Loss / Take Profit</Title>
				<Button
					style={{
						height: '20px',
						borderRadius: '4px',
						padding: '3px 5px',
					}}
				>
					<StyledCaretDownIcon style={{ transform: [{ rotateY: '180deg' }] }} flip={showInputs} />
				</Button>
			</ExpandRow>
			{showInputs && (
				<InputsContainer>
					<Spacer height={6} />

					<InputHeaderRow>
						<InputTitle>Stop Loss</InputTitle>
						<SelectorButtons options={SL_OPTIONS} onSelect={onSelectStopLossPercent} />
					</InputHeaderRow>

					<NumericInput
						invalid={slInvalid}
						dataTestId={'trade-panel-stop-loss-input'}
						right={'-10%'}
						value={stopLossPrice}
						disabled={!!pendingStopLoss}
						placeholder={pendingStopLoss ? 'Already pending SL' : '0.00'}
						onChange={onChangeStopLoss}
					/>

					<Spacer height={12} />

					<InputHeaderRow>
						<InputTitle>Take Profit</InputTitle>
						<SelectorButtons options={TP_OPTIONS} onSelect={onSelectTakeProfit} />
					</InputHeaderRow>

					<NumericInput
						invalid={tpInvalid}
						dataTestId={'trade-panel-take-profit-input'}
						right={'-10%'}
						value={takeProfitPrice}
						disabled={!!pendingTakeProfit}
						placeholder={pendingTakeProfit ? 'Already pending TP' : '0.00'}
						onChange={onChangeTakeProfit}
					/>
				</InputsContainer>
			)}
		</Container>
	);
}

const Container = styled.div`
	padding: 10px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
	margin-bottom: 16px;
`;

const InputHeaderRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
	cursor: default;
`;

const Title = styled(Body)`
	padding-top: 2px;
`;

const ExpandRow = styled(FlexDivRow)`
	padding: 0 2px 0 4px;
	cursor: pointer;
`;

const InputsContainer = styled.div`
	padding: 4px;
`;
