import React, { memo, ChangeEvent, MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
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
	onClick: MouseEventHandler<HTMLButtonElement>;
};

const EditStopLossAndTakeProfitInput: React.FC<OrderSizingProps> = memo(
	({ isMobile, type, invalid, currentPrice, onChange, onClick }) => {
		const { t } = useTranslation();
		const { takeProfitPrice, stopLossPrice } = useAppSelector(selectSlTpTradeInputs);
		const { takeProfitPrice: tpPrice, stopLossPrice: slPrice } = useAppSelector(
			selectSlTpOrderPrice
		);
		// eslint-disable-next-line no-console
		console.log(`take profit price: ${tpPrice}, stop loss price: ${slPrice}`);
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

				<InputHelpers>
					<NumericInput
						invalid={invalid}
						dataTestId={'edit-position-size-input' + (isMobile ? '-mobile' : '-desktop')}
						value={type === 'take-profit' ? takeProfitPrice : stopLossPrice}
						onChange={onChange}
						placeholder={type === 'take-profit' ? slPrice : tpPrice}
					/>

					<Button
						style={{ padding: '0 23px' }}
						onClick={onClick}
						disabled={type === 'take-profit' ? takeProfitPrice !== '' : stopLossPrice !== ''}
					>
						{type === 'take-profit'
							? t('futures.market.trade.edit-sl-tp.no-tp')
							: t('futures.market.trade.edit-sl-tp.no-sl')}
					</Button>
				</InputHelpers>
			</div>
		);
	}
);

const InputHelpers = styled.div`
	display: grid;
	grid-template-columns: 4fr 1fr;
	column-gap: 13px;
`;

const StyledInputHeaderRow = styled(InputHeaderRow)`
	margin-bottom: 9px;
`;

const StyledInputTitle = styled(InputTitle)`
	span {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

export default EditStopLossAndTakeProfitInput;
