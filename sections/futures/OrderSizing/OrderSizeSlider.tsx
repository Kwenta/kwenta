import { wei } from '@synthetixio/wei';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import ErrorView from 'components/Error';
import StyledSlider from 'components/Slider/StyledSlider';
import { useFuturesContext } from 'contexts/FuturesContext';
import {
	aboveMaxLeverageState,
	crossMarginAccountOverviewState,
	futuresTradeInputsState,
	leverageSideState,
	maxLeverageState,
	positionState,
} from 'store/futures';
import { FlexDivRow } from 'styles/common';

export default function OrderSizeSlider() {
	const { t } = useTranslation();
	const { onTradeAmountChange, maxUsdInputAmount } = useFuturesContext();

	const { freeMargin: freeCrossMargin } = useRecoilValue(crossMarginAccountOverviewState);
	const { susdSize } = useRecoilValue(futuresTradeInputsState);
	const aboveMaxLeverage = useRecoilValue(aboveMaxLeverageState);
	const maxLeverage = useRecoilValue(maxLeverageState);
	const position = useRecoilValue(positionState);
	const leverageSide = useRecoilValue(leverageSideState);

	const [percent, setPercent] = useState(0);
	const [usdValue, setUsdValue] = useState(susdSize);

	// eslint-disable-next-line
	const onChangeMarginPercent = useCallback(
		(value, commit = false) => {
			setPercent(value);
			const fraction = value / 100;
			const usdAmount = maxUsdInputAmount.mul(fraction).toString();
			const usdValue = Number(usdAmount).toFixed(0);
			setUsdValue(usdValue);
			onTradeAmountChange(usdValue, 'usd', { simulateChange: !commit });
		},
		[onTradeAmountChange, maxUsdInputAmount]
	);

	useEffect(() => {
		if (susdSize !== usdValue) {
			if (!susdSize || maxUsdInputAmount.eq(0)) {
				setPercent(0);
				return;
			}

			const percent = wei(susdSize).div(maxUsdInputAmount).mul(100).toNumber();
			setPercent(Number(percent.toFixed(2)));
		}
		// eslint-disable-next-line
	}, [susdSize]);

	if (aboveMaxLeverage && position?.position?.side === leverageSide) {
		return (
			<ErrorView
				message={t('futures.market.trade.input.max-leverage-error', {
					maxLeverage: parseInt(maxLeverage.toString()),
				})}
			/>
		);
	}

	return (
		<SliderRow>
			<StyledSlider
				minValue={0}
				maxValue={100}
				step={1}
				disabled={freeCrossMargin.eq(0)}
				defaultValue={percent}
				value={percent}
				onChange={(_, value) => onChangeMarginPercent(value, false)}
				onChangeCommitted={(_, value) => onChangeMarginPercent(value, true)}
				marks={[
					{ value: 0, label: `0%` },
					{ value: 100, label: `100%` },
				]}
				valueLabelDisplay="auto"
				valueLabelFormat={(v) => `${v}%`}
				$currentMark={percent}
			/>
		</SliderRow>
	);
}

const SliderRow = styled(FlexDivRow)`
	margin-top: 8px;
	margin-bottom: 32px;
	position: relative;
`;
