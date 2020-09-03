import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { SynthsMap } from 'lib/synthetix';

import Currency from 'components/Currency';
import BaseModal from 'components/BaseModal';
import Button from 'components/Button';

import { SelectableCurrencyRow, FlexDivRowCentered } from 'styles/common';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';

import { SynthBalances } from 'queries/walletBalances/types';

import { FiatCurrency } from 'store/app';

import { formatFiatCurrency } from 'utils/formatters/number';

import { RowsHeader, RowsContainer } from '../common';

type SelectAssetModalProps = {
	onDismiss: () => void;
	synthsMap: SynthsMap | null;
	synthBalances: SynthBalances;
	synthTotalUSDBalance: number | null;
	onSelect: (currencyKey: CurrencyKey) => void;
	fiatCurrency: FiatCurrency;
};

export const SelectSynthModal: FC<SelectAssetModalProps> = ({
	onDismiss,
	synthsMap,
	synthBalances,
	synthTotalUSDBalance,
	onSelect,
	fiatCurrency,
}) => {
	const { t } = useTranslation();
	const hasNonSynths = true;

	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen={true} title={t('modals.select-asset.title')}>
			<TotalValue>
				<Total>
					{synthTotalUSDBalance != null
						? formatFiatCurrency(synthTotalUSDBalance, { sign: fiatCurrency.sign })
						: NO_VALUE}
				</Total>
				<Title>{t('modals.select-asset.total-synth-value')}</Title>
			</TotalValue>
			<RowsHeader>
				<span>{t('modals.select-asset.header.your-synths')}</span>
				<span>{t('modals.select-asset.header.holdings')}</span>
			</RowsHeader>
			<RowsContainer style={{ height: 'auto' }}>
				{synthBalances.map(({ currencyKey, balance, usdBalance }) => {
					const name = synthsMap != null ? synthsMap[currencyKey]?.desc : null;

					return (
						<StyledSelectableCurrencyRow
							key={currencyKey}
							isSelectable={true}
							onClick={() => {
								onSelect(currencyKey);
								onDismiss();
							}}
						>
							<Currency.Name currencyKey={currencyKey} name={name} showIcon={true} />
							<Currency.Amount amount={balance} totalValue={usdBalance} sign={fiatCurrency.sign} />
						</StyledSelectableCurrencyRow>
					);
				})}
			</RowsContainer>
			{hasNonSynths && (
				<>
					<RowsSpacer />
					<RowsHeader>
						<span>{t('modals.select-asset.header.non-synths')}</span>
					</RowsHeader>
					<RowsContainer>
						<CryptoRow>
							<span>ETH</span>
							<Button variant="primary" isRounded={true}>
								{t('common.currency.convert-to-currency', { currencyKey: 'sETH' })}
							</Button>
						</CryptoRow>
					</RowsContainer>
				</>
			)}
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		height: 80vh;
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
	padding-bottom: 5px;
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

export default SelectSynthModal;
