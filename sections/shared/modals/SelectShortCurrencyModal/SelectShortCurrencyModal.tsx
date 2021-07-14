import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Synth } from '@synthetixio/contracts-interface';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { BottomShadow, NoTextTransform } from 'styles/common';

import { CurrencyKey } from 'constants/currency';

import { formatCurrency } from 'utils/formatters/number';

import { RowsContainer, CenteredModal, RowsHeader } from '../common';

import SynthRow from './SynthRow';
import useSynthetixQueries from '@synthetixio/queries';
import { walletAddressState } from 'store/wallet';
import { useRecoilValue } from 'recoil';

type SelectShortCurrencyModalProps = {
	onDismiss: () => void;
	onSelect: (currencyKey: CurrencyKey) => void;
	synths: Synth[];
	collateralCurrencyKey: CurrencyKey;
};

export const SelectShortCurrencyModal: FC<SelectShortCurrencyModalProps> = ({
	onDismiss,
	onSelect,
	synths,
	collateralCurrencyKey,
}) => {
	const { t } = useTranslation();

	const { useSynthsBalancesQuery, useExchangeRatesQuery } = useSynthetixQueries();

	const walletAddress = useRecoilValue(walletAddressState);

	const exchangeRatesQuery = useExchangeRatesQuery();

	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	} = useSelectedPriceCurrency();

	const collateralKeyUSDBalance =
		synthsWalletBalancesQuery.data?.balancesMap[collateralCurrencyKey]?.usdBalance ?? null;

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	return (
		<StyledCenteredModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('modals.select-short-currency.title')}
		>
			<TotalValue>
				<Total>
					{collateralKeyUSDBalance != null
						? formatCurrency(
								selectedPriceCurrency.name,
								selectPriceCurrencyRate != null
									? getPriceAtCurrentRate(collateralKeyUSDBalance)
									: collateralKeyUSDBalance,
								{
									sign: selectedPriceCurrency.sign,
								}
						  )
						: formatCurrency(selectedPriceCurrency.name, 0, {
								sign: selectedPriceCurrency.sign,
						  })}
				</Total>
				<Title>
					<Trans
						t={t}
						i18nKey="common.totals.your-currencyKey-balance"
						values={{ currencyKey: collateralCurrencyKey }}
						components={[<NoTextTransform />]}
					/>
				</Title>
			</TotalValue>
			<RowsHeader>
				<span>{t('common.asset')}</span>
				<span>{t('common.price')}</span>
			</RowsHeader>
			<RowsContainer>
				{synths.map((synth) => {
					const price = exchangeRates && exchangeRates[synth.name];
					const currencyKey = synth.name as CurrencyKey;

					return (
						<SynthRow
							key={currencyKey}
							synth={synth}
							price={price}
							onClick={() => {
								onSelect(currencyKey);
								onDismiss();
							}}
						/>
					);
				})}
			</RowsContainer>
			<StyledBottomShadow />
		</StyledCenteredModal>
	);
};

const StyledBottomShadow = styled(BottomShadow)`
	position: absolute;
	height: 32px;
`;

const StyledCenteredModal = styled(CenteredModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		max-height: 80vh;
		padding: 16px 0;
		overflow: hidden;
	}
`;

export const TotalValue = styled.div`
	padding: 0 16px 24px 16px;
	text-align: center;
`;

export const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: uppercase;
`;

export const Total = styled.div`
	font-size: 20px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
	padding-bottom: 10px;
`;

export default SelectShortCurrencyModal;
