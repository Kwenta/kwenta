import { CurrencyKey } from '@synthetixio/contracts-interface';
import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { FC, ReactNode, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

import InfoIcon from 'assets/svg/app/info.svg';
import OneInchImage from 'assets/svg/providers/1inch.svg';
import BaseModal from 'components/BaseModal';
import Currency from 'components/Currency';
import Error from 'components/Error';
import { ESTIMATE_VALUE } from 'constants/placeholder';
import useCurrencyPrice from 'hooks/useCurrencyPrice';
import useIsL2 from 'hooks/useIsL2';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { MessageButton } from 'sections/exchange/FooterCard/common';
import {
	FlexDivRowCentered,
	numericValueCSS,
	NoTextTransform,
	FlexDivColCentered,
	Tooltip,
	ExternalLink,
} from 'styles/common';
import { formatCurrency, LONG_CRYPTO_CURRENCY_DECIMALS } from 'utils/formatters/number';

export type TxProvider = 'synthetix' | '1inch' | 'synthswap';

type TxConfirmationModalProps = {
	onDismiss: () => void;
	txError: string | null;
	attemptRetry: () => void;
	baseCurrencyKey: string;
	baseCurrencyAmount: string;
	quoteCurrencyKey?: string;
	quoteCurrencyAmount?: string;
	totalTradePrice: string;
	feeCost: Wei | null;
	txProvider: TxProvider | null;
	quoteCurrencyLabel?: ReactNode;
	baseCurrencyLabel: ReactNode;
	icon?: ReactNode;
};

export const TxConfirmationModal: FC<TxConfirmationModalProps> = ({
	onDismiss,
	txError,
	attemptRetry,
	baseCurrencyKey,
	quoteCurrencyKey,
	baseCurrencyAmount,
	quoteCurrencyAmount,
	totalTradePrice,
	feeCost,
	txProvider,
	quoteCurrencyLabel,
	baseCurrencyLabel,
	icon,
}) => {
	const { t } = useTranslation();
	const isL2 = useIsL2();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const { address } = useAccount();
	const walletAddress = address || null;
	const { subgraph } = useSynthetixQueries();
	const getBaseCurrencyAmount = (decimals?: number) =>
		formatCurrency(baseCurrencyKey, baseCurrencyAmount, {
			minDecimals: decimals,
		});
	const priceUSD = useCurrencyPrice((quoteCurrencyKey ?? '') as CurrencyKey);

	const priceAdjustmentQuery = subgraph.useGetExchangeEntrySettleds(
		{
			where: { from: walletAddress },
		},
		{
			reclaim: true,
			rebate: true,
		}
	);

	const priceAdjustment = useMemo(
		() =>
			priceAdjustmentQuery.data?.length
				? {
						rebate: priceAdjustmentQuery.data[0].rebate,
						reclaim: priceAdjustmentQuery.data[0].reclaim,
				  }
				: {
						rebate: wei(0),
						reclaim: wei(0),
				  },
		[priceAdjustmentQuery.data]
	);

	const priceAdjustmentFeeUSD = useMemo(
		() => priceAdjustment.rebate.sub(priceAdjustment.reclaim).mul(priceUSD),
		[priceAdjustment, priceUSD]
	);

	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen title={t('modals.confirm-transaction.title')}>
			<Currencies>
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
			</Currencies>
			<Subtitle>{t('modals.confirm-transaction.confirm-with-provider')}</Subtitle>
			<Summary>
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
				</SummaryItem>
				{feeCost && (
					<SummaryItem>
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
								interactive
							>
								<TooltipItem>
									<InfoIcon />
								</TooltipItem>
							</StyledTooltip>
						</SummaryItemLabel>
						<SummaryItemValue data-testid="base-currency-value">
							<span>
								{formatCurrency(selectedPriceCurrency.name, feeCost, {
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
					<SummaryItemValue data-testid="total-trade-price-value">
						<span>
							{ESTIMATE_VALUE}{' '}
							{formatCurrency(selectedPriceCurrency.name, totalTradePrice, {
								sign: selectedPriceCurrency.sign,
							})}
						</span>
					</SummaryItemValue>
				</SummaryItem>
				{!isL2 && priceAdjustmentFeeUSD ? (
					<SummaryItem>
						<SummaryItemLabel data-testid="price-adjustment-label">
							<Trans
								i18nKey="common.currency.price-adjustment"
								components={[<NoTextTransform />]}
							/>
							&nbsp;
							<StyledTooltip
								placement="top"
								content={
									<Trans
										i18nKey="modals.confirm-transaction.price-adjustment-hint"
										values={{ currencyKey: baseCurrencyKey }}
										components={[<ExternalLink href="https://synthetix.io/synths" />]}
									/>
								}
								arrow={false}
								interactive
							>
								<TooltipItem>
									<InfoIcon />
								</TooltipItem>
							</StyledTooltip>
						</SummaryItemLabel>
						<SummaryItemValue data-testid="price-adjustment-value">
							<span>
								{formatCurrency(selectedPriceCurrency.name, priceAdjustmentFeeUSD.toString(), {
									sign: selectedPriceCurrency.sign,
								})}
							</span>
						</SummaryItemValue>
					</SummaryItem>
				) : null}
			</Summary>
			{txProvider === '1inch' && (
				<TxProviderContainer>
					<span>{t('common.powered-by')}</span>
					<OneInchImage width="40" height="40" alt={t('common.dex-aggregators.1inch.title')} />
				</TxProviderContainer>
			)}
			{txError != null && (
				<Actions>
					<Error message={txError} formatter="revert"></Error>
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
		width: 300px;
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
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
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	padding-bottom: 48px;
`;

const Summary = styled.div``;

const SummaryItem = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	padding-bottom: 8px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;

const SummaryItemLabel = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	${numericValueCSS};
`;

const Actions = styled(FlexDivColCentered)`
	margin: 8px 0px;
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

export default TxConfirmationModal;
