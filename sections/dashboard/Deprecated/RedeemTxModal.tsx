import { FC, ReactNode, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import Img from 'react-optimized-image';
import Wei, { wei } from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import { CurrencyKey } from '@synthetixio/contracts-interface';

import {
	FlexDivRowCentered,
	numericValueCSS,
	NoTextTransform,
	FlexDivColCentered,
	Tooltip,
	ExternalLink,
} from 'styles/common';

import { walletAddressState } from 'store/wallet';

import BaseModal from 'components/BaseModal';
import Currency from 'components/Currency';

import { formatCurrency, LONG_CRYPTO_CURRENCY_DECIMALS } from 'utils/formatters/number';
import { MessageButton } from 'sections/exchange/FooterCard/common';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { ESTIMATE_VALUE } from 'constants/placeholder';
import { Svg } from 'react-optimized-image';
import InfoIcon from 'assets/svg/app/info.svg';

export type TxProvider = 'synthetix' | '1inch' | 'balancer';

type RedeemTxModalProps = {
	onDismiss: () => void;
	txError: string | null;
	attemptRetry: () => void;
	transactionFee: number | null;
};

export const RedeemTxModal: FC<RedeemTxModalProps> = ({
	onDismiss,
	txError,
	attemptRetry,
	transactionFee,
}) => {
	const { t } = useTranslation();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const walletAddress = useRecoilValue(walletAddressState);

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('modals.confirm-transaction.title')}
		>
			{/* <Currencies>
				{quoteCurrencyKey && (
					<CurrencyItem>
						<CurrencyItemTitle>{quoteCurrencyLabel}</CurrencyItemTitle>
						<Currency.Icon
							currencyKey={quoteCurrencyKey}
							width="40px"
							height="40px"
							data-testid="quote-currency-img"
						/>
					</CurrencyItem>
				)}
				{icon && <ArrowsIconContainer>{icon}</ArrowsIconContainer>}
				<CurrencyItem>
					<CurrencyItemTitle>{baseCurrencyLabel}</CurrencyItemTitle>
					<Currency.Icon
						currencyKey={baseCurrencyKey}
						width="40px"
						height="40px"
						data-testid="base-currency-img"
					/>
				</CurrencyItem>
			</Currencies> */}
			<Subtitle>{t('modals.confirm-transaction.confirm-with-provider')}</Subtitle>
			<Summary>
				{/*
				{quoteCurrencyKey != null && quoteCurrencyAmount != null && (
					<SummaryItem>
						<SummaryItemLabel data-testid="quote-currency-label">
							<Trans
								i18nKey="common.currency.currency-amount"
								values={{ currencyKey: quoteCurrencyKey }}
								components={[<NoTextTransform />]}
							/>
						</SummaryItemLabel>
						<SummaryItemValue data-testid="quote-currency-value">
							{formatCurrency(quoteCurrencyKey, quoteCurrencyAmount)}
						</SummaryItemValue>
					</SummaryItem>
				)}
				<SummaryItem>
					<SummaryItemLabel data-testid="base-currency-label">
						<Trans
							i18nKey="common.currency.currency-amount"
							values={{ currencyKey: baseCurrencyKey }}
							components={[<NoTextTransform />]}
						/>
					</SummaryItemLabel>
					<SummaryItemValue data-testid="base-currency-value">
						<StyledTooltip
							placement="right"
							content={<span>{getBaseCurrencyAmount(LONG_CRYPTO_CURRENCY_DECIMALS)}</span>}
							arrow={false}
						>
							<span>
								{ESTIMATE_VALUE} {getBaseCurrencyAmount()}
							</span>
						</StyledTooltip>
					</SummaryItemValue>
				</SummaryItem> */}
				{transactionFee && (
					<SummaryItem>
						{/*
						<SummaryItemLabel data-testid="base-currency-label">
							<Trans
								i18nKey="common.currency.exchange-fee"
								values={{ currencyKey: baseCurrencyKey }}
								components={[<NoTextTransform />]}
							/>
							<StyledTooltip
								placement="top"
								content={
									<Trans
										i18nKey="modals.confirm-transaction.exchange-fee-hint"
										values={{ currencyKey: baseCurrencyKey }}
										components={[
											<NoTextTransform />,
											<ExternalLink href="https://synthetix.io/synths" />,
										]}
									/>
								}
								arrow={false}
								interactive={true}
							>
								<TooltipItem>
									<Svg src={InfoIcon} />
								</TooltipItem>
							</StyledTooltip>
            </SummaryItemLabel>
          */}
						<SummaryItemValue data-testid="base-currency-value">
							<span>
								{formatCurrency(selectedPriceCurrency.name, transactionFee, {
									sign: selectedPriceCurrency.sign,
								})}
							</span>
						</SummaryItemValue>
					</SummaryItem>
				)}
				<SummaryItem>
					<SummaryItemLabel data-testid="total-trade-price-label">
						<Trans
							i18nKey="common.currency.estimated-currency-value"
							values={{ currencyKey: selectedPriceCurrency.asset }}
							components={[<NoTextTransform />]}
						/>
					</SummaryItemLabel>
					{/* <SummaryItemValue data-testid="total-trade-price-value">
						<span>
							{ESTIMATE_VALUE}{' '}
							{formatCurrency(selectedPriceCurrency.name, totalTradePrice, {
								sign: selectedPriceCurrency.sign,
							})}
						</span>
					</SummaryItemValue> */}
				</SummaryItem>
			</Summary>
			{txError != null && (
				<Actions>
					<Message>{txError}</Message>
					<MessageButton onClick={attemptRetry} data-testid="retry-btn">
						{t('common.transaction.reattempt')}
					</MessageButton>
				</Actions>
			)}
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 270px;
	}
	.card-body {
		padding: 24px;
	}
`;

const Currencies = styled.div`
	display: grid;
	grid-gap: 24px;
	padding-bottom: 24px;
	justify-content: center;
	grid-auto-flow: column;
	align-items: flex-end;
`;

const CurrencyItem = styled.div`
	text-align: center;
	color: ${(props) => props.theme.colors.white};
`;

const CurrencyItemTitle = styled.div`
	padding-bottom: 8px;
	text-transform: capitalize;
`;

const ArrowsIconContainer = styled.div`
	color: ${(props) => props.theme.colors.goldColors.color1};
	padding-bottom: 2px;
`;

const Subtitle = styled.div`
	text-align: center;
	color: ${(props) => props.theme.colors.silver};
	padding-bottom: 48px;
`;

const Summary = styled.div``;

const SummaryItem = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	padding-bottom: 8px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;

const SummaryItemLabel = styled.div``;

const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	${numericValueCSS};
`;

const Actions = styled(FlexDivColCentered)`
	margin: 8px 0px;
`;

const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
	margin: 16px 0px;
`;

const TxProviderContainer = styled.div`
	padding-top: 32px;
	text-align: center;
	img {
		vertical-align: middle;
		margin-left: 10px;
	}
`;

const StyledTooltip = styled(Tooltip)`
	.tippy-content {
		padding: 5px;
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 12px;
	}
`;

export const TooltipItem = styled.span`
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	svg {
		margin-left: 5px;
		transform: translateY(2px);
	}
`;

export default RedeemTxModal;
