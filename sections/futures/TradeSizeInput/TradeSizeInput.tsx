import { FC, ChangeEvent } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Wei from '@synthetixio/wei';

import NumericInput from 'components/Input/NumericInput';
import Button from 'components/Button';
import { Synths } from 'constants/currency';
import { FlexDivCol, FlexDivRow, FlexDivRowCentered, FlexDivCentered } from 'styles/common';
import { formatCurrency, formatCryptoCurrency } from 'utils/formatters/number';

type TradeSizeInputProps = {
	balance: Wei;
	assetRate: number;
	amount: string;
	onAmountChange: (value: string) => void;
	handleOnMax: () => void;
	asset: string;
	balanceLabel: string;
};

const TradeSizeInput: FC<TradeSizeInputProps> = ({
	amount,
	onAmountChange,
	balance,
	balanceLabel,
	assetRate,
	handleOnMax,
}) => {
	const { t } = useTranslation();

	const amountValue = Number(amount) * assetRate;
	return (
		<InputRow>
			<StyledFlexDivCentered>
				<InputContainer>
					<FlexDivCol>
						<InputAmount
							value={amount}
							onChange={(_: ChangeEvent<HTMLInputElement>, value: string) => onAmountChange(value)}
							placeholder="0"
							data-testid="margin-amount"
						/>
						<ValueAmount>{formatCurrency(Synths.sUSD, amountValue, { sign: '$' })}</ValueAmount>
					</FlexDivCol>
					<MaxButton onClick={handleOnMax} variant="text">
						{t('futures.market.trade.input.max')}
					</MaxButton>
				</InputContainer>
			</StyledFlexDivCentered>
			<FlexDivRow>
				<BalanceSubtitle>{balanceLabel}</BalanceSubtitle>
				<BalanceValue>{formatCryptoCurrency(balance.toString())}</BalanceValue>
			</FlexDivRow>
		</InputRow>
	);
};

const InputRow = styled(FlexDivCol)`
	width: 100%;
	margin-top: 5px;
	margin-bottom: 24px;
`;

const StyledFlexDivCentered = styled(FlexDivCentered)`
	width: 100%;
`;

const InputContainer = styled(FlexDivRowCentered)`
	background: ${(props) => props.theme.colors.black};
	border-radius: 4px;
	padding: 4px;
	height: 48px;
	width: 100%;
`;

const InputAmount = styled(NumericInput)`
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.silver};
`;

const ValueAmount = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 10px;
	color: ${(props) => props.theme.colors.blueberry};
	margin-left: 8px;
`;

const MaxButton = styled(Button)`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.goldColors.color2};
	font-size: 12px;
	text-transform: uppercase;
	margin-right: 4px;
`;

const BalanceSubtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	text-transform: capitalize;
	margin-top: 6px;
`;

const BalanceValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	margin-top: 6px;
`;

export default TradeSizeInput;
