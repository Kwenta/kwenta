import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import Link from 'next/link';
import { isWalletConnectedState } from 'store/wallet';
import { useRecoilValue } from 'recoil';

import Currency from 'components/Currency';
import Button from 'components/Button';

import {
	FlexDivRowCentered,
	NoTextTransform,
	ExternalLink,
	FlexDivColCentered,
} from 'styles/common';

import { CRYPTO_CURRENCY_MAP, CurrencyKey, SYNTHS_MAP } from 'constants/currency';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import { formatCurrency } from 'utils/formatters/number';

import { RowsHeader, RowsContainer, CenteredModal } from '../common';
import { EXTERNAL_LINKS } from 'constants/links';
import Connector from 'containers/Connector';
import ROUTES from 'constants/routes';

import SynthRow from './SynthRow';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

type SelectQuoteCurrencyModalProps = {
	onDismiss: () => void;
	onSelect: (currencyKey: CurrencyKey) => void;
};

const { sETH, sUSD } = SYNTHS_MAP;
const { ETH } = CRYPTO_CURRENCY_MAP;

export const SelectQuoteCurrencyModal: FC<SelectQuoteCurrencyModalProps> = ({
	onDismiss,
	onSelect,
}) => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const synthsWalletBalancesQuery = useSynthsBalancesQuery();
	const {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	} = useSelectedPriceCurrency();

	const synthBalances = synthsWalletBalancesQuery.data?.balances ?? [];
	let synthTotalUSDBalance = synthsWalletBalancesQuery.data?.totalUSDBalance ?? null;

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('modals.select-quote-currency.title')}
		>
			<TotalValue>
				<Total>
					{synthTotalUSDBalance != null
						? formatCurrency(
								selectedPriceCurrency.name,
								selectPriceCurrencyRate != null
									? getPriceAtCurrentRate(synthTotalUSDBalance)
									: synthTotalUSDBalance,
								{
									sign: selectedPriceCurrency.sign,
								}
						  )
						: formatCurrency(selectedPriceCurrency.name, 0, {
								sign: selectedPriceCurrency.sign,
						  })}
				</Total>
				<Title>{t('common.totals.total-synth-value')}</Title>
			</TotalValue>
			{synthBalances.length > 0 ? (
				<>
					<RowsHeader>
						<span>{t('modals.select-quote-currency.header.your-synths')}</span>
						<span>{t('modals.select-quote-currency.header.holdings')}</span>
					</RowsHeader>
					<RowsContainer>
						{synthBalances.map((synth) => {
							const currencyKey = synth.currencyKey;

							return (
								<SynthRow
									key={synth.currencyKey}
									synth={synth}
									onClick={() => {
										onSelect(currencyKey);
										onDismiss();
									}}
								/>
							);
						})}
					</RowsContainer>
					{/* TODO: this list needs to contain crypto -> synth supported assets (so we need to check existing assets + verify they are supported as synths) */}
					<RowsSpacer />
					<RowsHeader>
						<span>{t('modals.select-quote-currency.header.non-synths')}</span>
					</RowsHeader>
					<CryptoRowsContainer>
						<CryptoRow>
							<Currency.Name currencyKey={ETH} showIcon={true} iconProps={{ type: 'asset' }} />
							<ExternalLink href={EXTERNAL_LINKS.Trading.OneInchLink(ETH, sETH)}>
								<ConvertButton variant="primary" isRounded={true}>
									<Trans
										i18nKey="common.currency.trade-to-currency"
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
								i18nKey="common.currency.buy-currency"
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

export default SelectQuoteCurrencyModal;
