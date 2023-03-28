import { wei } from '@synthetixio/wei';
import React, { useMemo, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import InputHeaderRow from 'components/Input/InputHeaderRow';
import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { NO_VALUE } from 'constants/placeholder';
import { editCrossMarginPositionMargin } from 'state/futures/actions';
import {
	selectPosition,
	selectIdleMargin,
	selectEditPositionInputs,
	selectSkewAdjustedPriceInfo,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber, formatDollars } from 'utils/formatters/number';

type OrderSizingProps = {
	isMobile?: boolean;
	type: 'deposit' | 'withdraw' | 'take-profit' | 'stop-loss';
};

const EditStopLossAndTakeProfitInput: React.FC<OrderSizingProps> = memo(({ isMobile, type }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const position = useAppSelector(selectPosition);
	const { marginDelta } = useAppSelector(selectEditPositionInputs);
	const idleMargin = useAppSelector(selectIdleMargin);
	const markPrice = useAppSelector(selectSkewAdjustedPriceInfo);

	const maxWithdraw = useMemo(() => {
		const max = (position?.remainingMargin ?? wei(0)).sub(50);
		return wei(Math.max(0, max.toNumber()));
	}, [position?.remainingMargin]);

	const maxUsdInputAmount = type === 'deposit' ? idleMargin : maxWithdraw;

	const onChangeMargin = useCallback(
		(value: string) => {
			dispatch(editCrossMarginPositionMargin(type === 'deposit' ? value : '-' + value));
		},
		[dispatch, type]
	);

	const handleSetMax = useCallback(() => {
		onChangeMargin(String(floorNumber(maxUsdInputAmount)));
	}, [onChangeMargin, maxUsdInputAmount]);

	const onChangeValue = useCallback((_, v: string) => onChangeMargin(v), [onChangeMargin]);

	const invalidMaxWithdraw = maxWithdraw.lt(marginDelta || 0);

	const invalid =
		marginDelta !== '' && (maxUsdInputAmount.lte(marginDelta || 0) || invalidMaxWithdraw);

	return (
		<div>
			<InputHeaderRow
				label={
					type === 'take-profit'
						? 'Take Profit'
						: type === 'stop-loss'
						? 'Stop Loss'
						: type === 'deposit'
						? 'Add margin amount'
						: 'Withdraw amount'
				}
				rightElement={
					<InputTitle>
						{t('futures.market.trade.edit-sl-tp.last-price')}:{' '}
						{markPrice ? formatDollars(markPrice.price, { suggestDecimals: true }) : NO_VALUE}
					</InputTitle>
				}
			/>

			<InputHelpers>
				<NumericInput
					invalid={invalid}
					dataTestId={'edit-position-size-input' + (isMobile ? '-mobile' : '-desktop')}
					value={marginDelta.replace('-', '')}
					placeholder="0.00"
					onChange={onChangeValue}
					style={{ width: '270px' }}
				/>

				<Button>No TP</Button>
			</InputHelpers>
		</div>
	);
});

const InputHelpers = styled.div`
	display: flex;
	justify-content: space-between;
`;

export default EditStopLossAndTakeProfitInput;
