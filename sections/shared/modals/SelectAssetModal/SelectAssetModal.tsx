import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import Link from 'next/link';
import { Synth, SynthsMap } from 'lib/synthetix';

import Currency from 'components/Currency';
import Button from 'components/Button';

import {
	SelectableCurrencyRow,
	FlexDivRowCentered,
	NoTextTransform,
	ExternalLink,
	FlexDivColCentered,
} from 'styles/common';

import { CRYPTO_CURRENCY_MAP, CurrencyKey, SYNTHS_MAP } from 'constants/currency';

import { SynthBalance } from 'queries/walletBalances/useSynthsBalancesQuery';

import { formatCurrency } from 'utils/formatters/number';

import { RowsHeader, RowsContainer, CenteredModal } from '../common';
import { EXTERNAL_LINKS } from 'constants/links';
import Connector from 'containers/Connector';
import ROUTES from 'constants/routes';

type SelectAssetModalProps = {
	onDismiss: () => void;
	synthsMap: SynthsMap | null;
	synthBalances: SynthBalance[];
	synthTotalUSDBalance: number | null;
	onSelect: (currencyKey: CurrencyKey) => void;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
	isWalletConnected: boolean;
};

const { sETH, sUSD } = SYNTHS_MAP;
const { ETH } = CRYPTO_CURRENCY_MAP;

export const SelectSynthModal: FC<SelectAssetModalProps> = ({
	onDismiss,
	synthsMap,
	synthBalances,
	synthTotalUSDBalance,
	onSelect,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
	isWalletConnected,
}) => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();

	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen={true} title={t('modals.select-asset.title')}>
			<TotalValue>
				<Total>
					{synthTotalUSDBalance != null
						? formatCurrency(
								selectedPriceCurrency.name,
								selectPriceCurrencyRate != null
									? (synthTotalUSDBalance /= selectPriceCurrencyRate)
									: synthTotalUSDBalance,
								{
									sign: selectedPriceCurrency.sign,
								}
						  )
						: formatCurrency(selectedPriceCurrency.name, 0, {
								sign: selectedPriceCurrency.sign,
						  })}
				</Total>
				<Title>{t('modals.select-asset.total-synth-value')}</Title>
			</TotalValue>
			{synthBalances.length > 0 ? (
				<>
					<RowsHeader>
						<span>{t('modals.select-asset.header.your-synths')}</span>
						<span>{t('modals.select-asset.header.holdings')}</span>
					</RowsHeader>
					<RowsContainer>
						{synthBalances.map(({ currencyKey, balance, usdBalance }) => {
							const synthDesc = synthsMap != null ? synthsMap[currencyKey]?.description : null;

							const totalValue = usdBalance;

							return (
								<StyledSelectableCurrencyRow
									key={currencyKey}
									isSelectable={true}
									onClick={() => {
										onSelect(currencyKey);
										onDismiss();
									}}
								>
									<Currency.Name
										currencyKey={currencyKey}
										name={t('common.currency.synthetic-currency-name', {
											currencyName: synthDesc,
										})}
										showIcon={true}
									/>
									<Currency.Amount
										currencyKey={currencyKey}
										amount={balance}
										totalValue={totalValue}
										sign={selectedPriceCurrency.sign}
										conversionRate={selectPriceCurrencyRate}
									/>
								</StyledSelectableCurrencyRow>
							);
						})}
					</RowsContainer>
					{/* TODO: this list needs to contain crypto -> synth supported assets (so we need to check existing assets + verify they are supported as synths) */}
					<RowsSpacer />
					<RowsHeader>
						<span>{t('modals.select-asset.header.non-synths')}</span>
					</RowsHeader>
					<CryptoRowsContainer>
						<CryptoRow>
							<Currency.Name currencyKey={ETH} showIcon={true} iconProps={{ type: 'asset' }} />
							<ExternalLink href={EXTERNAL_LINKS.Trading.OneInchLink(ETH, sETH)}>
								<ConvertButton variant="primary" isRounded={true}>
									<Trans
										i18nKey="common.currency.convert-to-currency"
										values={{ currencyKey: sETH }}
										components={[<NoTextTransform />]}
									/>
								</ConvertButton>
							</ExternalLink>
						</CryptoRow>
					</CryptoRowsContainer>
				</>
			) : !isWalletConnected ? (
				<ContainerEmptyState>
					<Message>{t('exchange.connect-wallet-card.message')}</Message>
					<MessageButton
						onClick={() => {
							onDismiss();
							connectWallet();
						}}
					>
						{t('common.wallet.connect-wallet')}
					</MessageButton>
				</ContainerEmptyState>
			) : (
				<ContainerEmptyState>
					<Message>
						<Trans
							t={t}
							i18nKey="exchange.onboard.message"
							values={{ currencyKey: sUSD }}
							components={[<NoTextTransform />]}
						/>
					</Message>
					<Link href={ROUTES.Dashboard.Convert}>
						<MessageButton>
							<Trans
								t={t}
								i18nKey="common.currency.get-currency"
								values={{ currencyKey: sUSD }}
								components={[<NoTextTransform />]}
							/>
						</MessageButton>
					</Link>
				</ContainerEmptyState>
			)}
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(CenteredModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		max-height: 80vh;
		padding: 24px 0;
		overflow: hidden;
	}
`;

const TotalValue = styled.div`
	padding: 0 16px 24px 16px;
	text-align: center;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: uppercase;
`;

const Total = styled.div`
	font-size: 20px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
	padding-bottom: 10px;
`;

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding: 5px 16px;
`;

const RowsSpacer = styled.div`
	height: 32px;
`;

const CryptoRow = styled(FlexDivRowCentered)`
	padding: 5px 16px;
`;

const ConvertButton = styled(Button)`
	text-transform: none;
	&::first-letter {
		text-transform: capitalize;
	}
`;

const ContainerEmptyState = styled(FlexDivColCentered)`
	margin: 8px 0px;
	padding: 0 30px;
	button {
		width: 200px;
	}
`;

const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	padding: 24px 32px;
	text-align: center;
`;

const MessageButton = styled(Button).attrs({ variant: 'primary', size: 'lg', isRounded: true })`
	width: 200px;
`;

const CryptoRowsContainer = styled(RowsContainer)`
	flex-shrink: 0;
`;

export default SelectSynthModal;
