import React, { memo, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import InputHeaderRow from 'components/Input/InputHeaderRow';
import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { selectSlTpOrderPrice, selectSlTpTradeInputs } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

type OrderSizingProps = {
	isMobile?: boolean;
	type: 'take-profit' | 'stop-loss';
	invalid: boolean;
	currentPrice: string;
	onChange: (_: ChangeEvent<HTMLInputElement>, v: string) => void;
};

const EditStopLossAndTakeProfitInput: React.FC<OrderSizingProps> = memo(
	({ isMobile, type, invalid, currentPrice, onChange }) => {
		const { t } = useTranslation();
		const { takeProfitPrice: tpInputPrice, stopLossPrice: slInputPrice } = useAppSelector(
			selectSlTpTradeInputs
		);
		const { takeProfitPrice: tpOrderPrice, stopLossPrice: slOrderPrice } = useAppSelector(
			selectSlTpOrderPrice
		);

		return (
			<div style={{ marginTop: '5px', marginBottom: '10px' }}>
				<StyledInputHeaderRow
					label={type === 'take-profit' ? 'Take Profit' : 'Stop Loss'}
					rightElement={
						<StyledInputTitle>
							{t('futures.market.trade.edit-sl-tp.last-price')}: <span>{currentPrice}</span>
						</StyledInputTitle>
					}
				/>

				<NumericInput
					invalid={invalid}
					dataTestId={'edit-position-size-input' + (isMobile ? '-mobile' : '-desktop')}
					value={
						type === 'take-profit'
							? tpInputPrice === '0'
								? t('futures.market.trade.edit-sl-tp.no-tp')
								: tpInputPrice
							: slInputPrice === '0'
							? t('futures.market.trade.edit-sl-tp.no-sl')
							: slInputPrice
					}
					onChange={onChange}
					placeholder={type === 'take-profit' ? tpOrderPrice : slOrderPrice}
				/>
			</div>
		);
	}
);

const StyledInputHeaderRow = styled(InputHeaderRow)`
	margin-bottom: 9px;
`;

const StyledInputTitle = styled(InputTitle)`
	span {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

export default EditStopLossAndTakeProfitInput;
