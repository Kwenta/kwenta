import { CurrencyKey } from '@synthetixio/contracts-interface';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { FC, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { closeModal } from 'state/exchange/reducer';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import styled from 'styled-components';

import ArrowsIcon from 'assets/svg/app/circle-arrows.svg';
import InfoIcon from 'assets/svg/app/info.svg';
import OneInchImage from 'assets/svg/providers/1inch.svg';
import BaseModal from 'components/BaseModal';
import Currency from 'components/Currency';
import Error from 'components/Error';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { ESTIMATE_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import useCurrencyPrice from 'hooks/useCurrencyPrice';
import useIsL2 from 'hooks/useIsL2';
import { MessageButton } from 'sections/exchange/FooterCard/common';
import { txErrorState } from 'store/exchange';
import {
	FlexDivRowCentered,
	numericValueCSS,
	NoTextTransform,
	FlexDivColCentered,
} from 'styles/common';
import { formatCurrency, LONG_CRYPTO_CURRENCY_DECIMALS } from 'utils/formatters/number';

export type TxProvider = 'synthetix' | '1inch' | 'synthswap';

type TxConfirmationModalProps = {
	attemptRetry: () => void;
};

export const TxConfirmationModal: FC<TxConfirmationModalProps> = ({ attemptRetry }) => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const isL2 = useIsL2();
	const txError = useRecoilValue(txErrorState);
	const dispatch = useAppDispatch();

	const { subgraph } = useSynthetixQueries();

	const {
		baseCurrencyKey,
		quoteCurrencyKey,
		txProvider,
		feeCost,
		baseAmount,
		quoteAmount,
		totalTradePrice,
	} = useAppSelector(({ exchange }) => ({
		baseCurrencyKey: exchange.baseCurrencyKey,
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		txProvider: exchange.txProvider,
		feeCost: exchange.feeCost,
		baseAmount: exchange.baseAmount,
		quoteAmount: exchange.quoteAmount,
		totalTradePrice: exchange.estimatedBaseTradePrice,
	}));

	const getBaseCurrencyAmount = (decimals?: number) =>
		formatCurrency(baseCurrencyKey!, baseAmount, {
			minDecimals: decimals,
		});
	const priceUSD = useCurrencyPrice((quoteCurrencyKey ?? '') as CurrencyKey);

	const onDismiss = () => {
		dispatch(closeModal());
	};

	const priceAdjustmentQuery = subgraph.useGetExchangeEntrySettleds(
		{ where: { from: walletAddress } },
		{ reclaim: true, rebate: true }
	);

	const priceAdjustment = useMemo(
		() =>
			priceAdjustmentQuery.data?.length
				? {
						rebate: priceAdjustmentQuery.data[0].rebate,
						reclaim: priceAdjustmentQuery.data[0].reclaim,
				  }
				: { rebate: wei(0), reclaim: wei(0) },
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
						<CurrencyItemTitle>{t('exchange.common.from')}</CurrencyItemTitle>
						<Currency.Icon
							currencyKey={quoteCurrencyKey}
							width="40px"
							height="40px"
							data-testid="quote-currency-img"
						/>
					</CurrencyItem>
				)}
				<ArrowsIconContainer>
					<ArrowsIcon />
				</ArrowsIconContainer>
				<CurrencyItem>
					<CurrencyItemTitle>{t('exchange.common.into')}</CurrencyItemTitle>
					<Currency.Icon
						currencyKey={baseCurrencyKey!}
						width="40px"
						height="40px"
						data-testid="base-currency-img"
					/>
				</CurrencyItem>
			</Currencies>
			<Subtitle>{t('modals.confirm-transaction.confirm-with-provider')}</Subtitle>
			<Summary>
				{quoteCurrencyKey != null && quoteAmount != null && (
					<SummaryItem>
						<SummaryItemLabel data-testid="quote-currency-label">
							<Trans
								i18nKey="common.currency.currency-amount"
								values={{ currencyKey: quoteCurrencyKey }}
								components={[<NoTextTransform />]}
							/>
						</SummaryItemLabel>
						<SummaryItemValue data-testid="quote-currency-value">
							{formatCurrency(quoteCurrencyKey, quoteAmount)}
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
						<CustomStyledTooltip
							preset="top"
							content={<span>{getBaseCurrencyAmount(LONG_CRYPTO_CURRENCY_DECIMALS)}</span>}
						>
							<span>
								{ESTIMATE_VALUE} {getBaseCurrencyAmount()}
							</span>
						</CustomStyledTooltip>
					</SummaryItemValue>
				</SummaryItem>
				{txProvider === 'synthetix' && feeCost && (
					<SummaryItem>
						<SummaryItemLabel data-testid="base-currency-label">
							<Trans
								i18nKey="common.currency.exchange-fee"
								values={{ currencyKey: baseCurrencyKey }}
								components={[<NoTextTransform />]}
							/>
							<ExchangeFeeHintTooltip
								preset="top"
								content={
									<Trans
										i18nKey="modals.confirm-transaction.exchange-fee-hint"
										values={{ currencyKey: baseCurrencyKey }}
										components={[<NoTextTransform />]}
									/>
								}
							>
								<TooltipItem>
									<InfoIcon />
								</TooltipItem>
							</ExchangeFeeHintTooltip>
						</SummaryItemLabel>
						<SummaryItemValue data-testid="base-currency-value">
							<span>{formatCurrency('sUSD', feeCost, { sign: '$' })}</span>
						</SummaryItemValue>
					</SummaryItem>
				)}
				<SummaryItem>
					<SummaryItemLabel data-testid="total-trade-price-label">
						<Trans
							i18nKey="common.currency.estimated-currency-value"
							values={{ currencyKey: 'sUSD' }}
							components={[<NoTextTransform />]}
						/>
					</SummaryItemLabel>
					<SummaryItemValue data-testid="total-trade-price-value">
						<span>
							{ESTIMATE_VALUE} {formatCurrency('sUSD', totalTradePrice ?? '', { sign: '$' })}
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
							<PriceAdjustmentTooltip
								preset="top"
								content={
									<Trans
										i18nKey="modals.confirm-transaction.price-adjustment-hint"
										values={{ currencyKey: baseCurrencyKey }}
									/>
								}
							>
								<TooltipItem>
									<InfoIcon />
								</TooltipItem>
							</PriceAdjustmentTooltip>
						</SummaryItemLabel>
						<SummaryItemValue data-testid="price-adjustment-value">
							<span>{formatCurrency('sUSD', priceAdjustmentFeeUSD.toString(), { sign: '$' })}</span>
						</SummaryItemValue>
					</SummaryItem>
				) : null}
			</Summary>
			{txProvider === '1inch' && (
				<TxProviderContainer>
					<Text>{t('common.powered-by')}</Text>
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
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
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`;

const SummaryItemLabel = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	${numericValueCSS};
`;

const Actions = styled(FlexDivColCentered)`
	margin: 8px 0px;
`;

const Text = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
`;

const TxProviderContainer = styled(FlexDivRowCentered)`
	padding-top: 32px;
	img {
		vertical-align: middle;
		margin-left: 10px;
	}
	justify-content: center;
`;

const CustomStyledTooltip = styled(StyledTooltip)`
	padding: 10px;
	width: 100%;
	word-break: all;
`;

const ExchangeFeeHintTooltip = styled(StyledTooltip)`
	width: 240px;
	padding: 0px 10px;
	margin: 0px 0px 0px 40px;
`;

const PriceAdjustmentTooltip = styled(StyledTooltip)`
	width: 240px;
	padding: 0px 10px;
	margin: 0px;
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
