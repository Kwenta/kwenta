import Wei, { wei } from '@synthetixio/wei';
import { FC, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Card from 'components/Card';
import Connector from 'containers/Connector';
import { FlexDivRowCentered } from 'styles/common';
import { zeroBN } from 'utils/formatters/number';

import { Side } from '../types';
import CurrencyCardInput from './CurrencyCardInput';
import CurrencyCardSelector from './CurrencyCardSelector';

type CurrencyCardProps = {
	side: Side;
	currencyKey: string | null;
	currencyName: string | null;
	amount: string;
	onAmountChange: (value: string) => void;
	walletBalance: Wei | null;
	onBalanceClick: () => void;
	onCurrencySelect?: () => void;
	priceRate: Wei | number | null;
	className?: string;
	label: string;
	disableInput?: boolean;
	slippagePercent?: Wei | null;
	isLoading?: boolean;
	disabled?: boolean;
};

const CurrencyCard: FC<CurrencyCardProps> = memo(
	({
		side,
		currencyKey,
		currencyName,
		amount,
		slippagePercent,
		onAmountChange,
		walletBalance,
		onBalanceClick,
		onCurrencySelect,
		priceRate,
		label,
		disableInput = false,
		isLoading = false,
		disabled,
		...rest
	}) => {
		const { t } = useTranslation();
		const { synthsMap } = Connector.useContainer();

		const isBase = useMemo(() => side === 'base', [side]);

		const hasWalletBalance = useMemo(() => !!walletBalance && !!currencyKey, [
			walletBalance,
			currencyKey,
		]);

		const amountBN = useMemo(() => (amount === '' ? zeroBN : wei(amount)), [amount]);

		const insufficientBalance = useMemo(
			() => (!isBase && hasWalletBalance ? amountBN.gt(walletBalance!) : false),
			[isBase, hasWalletBalance, amountBN, walletBalance]
		);

		const hasCurrencySelectCallback = onCurrencySelect != null;

		const tokenName = useMemo(() => {
			return currencyKey && synthsMap[currencyKey]
				? t('common.currency.synthetic-currency-name', {
						currencyName,
				  })
				: currencyName || t('exchange.currency-card.synth-name');
		}, [currencyKey, currencyName, t, synthsMap]);

		return (
			<CardContainer>
				<StyledCard
					data-testid={'currency-card-' + side}
					className={`currency-card currency-card-${side}`}
					interactive
					{...rest}
				>
					<StyledCardBody className="currency-card-body">
						<CurrencyContainer className="currency-container">
							<CurrencyCardInput
								disableInput={disableInput}
								disabled={disabled}
								label={label}
								amount={amount}
								isBase={isBase}
								onAmountChange={onAmountChange}
								isLoading={isLoading}
								currencyKeySelected={!!currencyKey}
								hasWalletBalance={hasWalletBalance}
								onBalanceClick={onBalanceClick}
								slippagePercent={slippagePercent}
								priceRate={priceRate}
							/>

							<CurrencyCardSelector
								tokenName={tokenName}
								insufficientBalance={insufficientBalance}
								disableInput={disableInput}
								onBalanceClick={onBalanceClick}
								onCurrencySelect={onCurrencySelect}
								walletBalance={walletBalance}
								hasWalletBalance={hasWalletBalance}
								currencyKey={currencyKey}
								hasCurrencySelectCallback={hasCurrencySelectCallback}
							/>
						</CurrencyContainer>
					</StyledCardBody>
				</StyledCard>
			</CardContainer>
		);
	}
);

const CardContainer = styled.div`
	display: grid;
	height: 183px;
`;

const StyledCard = styled(Card)<{ interactive?: boolean }>`
	${(props) =>
		!props.interactive &&
		css`
			pointer-events: none;
		`}
`;

const StyledCardBody = styled(Card.Body)`
	padding: 20px 32px;
`;

const CurrencyContainer = styled(FlexDivRowCentered)`
	gap: 20px;
`;

export default CurrencyCard;
