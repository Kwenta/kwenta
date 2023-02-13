import React, { ChangeEvent, useMemo, memo } from 'react';
import styled from 'styled-components';

import CustomInput from 'components/Input/CustomInput';
import InputTitle from 'components/Input/InputTitle';
import { FlexDivRow } from 'components/layout/flex';
import { selectSusdBalance } from 'state/balances/selectors';
import { setCrossMarginMarginDelta } from 'state/futures/reducer';
import {
	selectCrossMarginBalanceInfo,
	selectPosition,
	selectFuturesType,
	selectSelectedInputDenomination,
	selectMarginDeltaInputValue,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

type MarginInputProps = {
	isMobile?: boolean;
	disabled?: boolean;
};

const MarginInput: React.FC<MarginInputProps> = memo(({ disabled, isMobile }) => {
	const dispatch = useAppDispatch();

	const { freeMargin: freeCrossMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const position = useAppSelector(selectPosition);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const assetInputType = useAppSelector(selectSelectedInputDenomination);
	const { freeMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const walletBalance = useAppSelector(selectSusdBalance);
	const marginDeltaInputValue = useAppSelector(selectMarginDeltaInputValue);

	const maxMargin = selectedAccountType === 'cross_margin' ? freeMargin : walletBalance;

	const handleSetMax = () => {
		dispatch(setCrossMarginMarginDelta(maxMargin.toString()));
	};

	const onChangeValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		dispatch(setCrossMarginMarginDelta(v));
	};

	const isDisabled = useMemo(() => {
		const remaining =
			selectedAccountType === 'isolated_margin'
				? position?.remainingMargin || zeroBN
				: freeCrossMargin;
		return remaining.lte(0) || disabled;
	}, [position?.remainingMargin, disabled, selectedAccountType, freeCrossMargin]);

	const invalid =
		assetInputType === 'usd' &&
		marginDeltaInputValue !== '' &&
		maxMargin.lt(marginDeltaInputValue || 0);

	return (
		<>
			<Container>
				<OrderSizingRow>
					<InputTitle>
						Margin&nbsp; —<span>&nbsp; Set collateral to use</span>
					</InputTitle>
					<InputHelpers>
						<MaxButton onClick={handleSetMax}>Max</MaxButton>
					</InputHelpers>
				</OrderSizingRow>

				<CustomInput
					invalid={invalid}
					dataTestId={'set-order-margin-susd' + (isMobile ? '-mobile' : '-desktop')}
					disabled={isDisabled}
					value={marginDeltaInputValue}
					placeholder="0.00"
					onChange={onChangeValue}
				/>
			</Container>
		</>
	);
});

const Container = styled.div`
	margin-top: 18px;
	margin-bottom: 16px;
`;

const OrderSizingRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	margin-bottom: 8px;
	cursor: default;
`;

const MaxButton = styled.button`
	text-decoration: underline;
	font-variant: small-caps;
	text-transform: lowercase;
	font-size: 13px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`;

const InputHelpers = styled.div`
	display: flex;
`;

export default MarginInput;
