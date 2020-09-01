import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Rates } from 'queries/rates/useExchangeRatesQuery';
import { SynthDefinitions } from 'lib/snxContracts';

import BaseModal from 'components/BaseModal';
import { FlexDivRowCentered } from 'styles/common';
import { CurrencyKey } from 'constants/currency';

type SelectSynthModalProps = {
	onDismiss: () => void;
	synths: SynthDefinitions;
	exchangeRates?: Rates;
	onSelect: (currencyKey: CurrencyKey) => void;
};

export const SelectSynthModal: FC<SelectSynthModalProps> = ({
	onDismiss,
	exchangeRates,
	synths,
	onSelect,
}) => {
	const { t } = useTranslation();

	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen={true} title={t('modals.select-synth.title')}>
			{synths.map((synth) => (
				<FlexDivRowCentered
					onClick={() => {
						onSelect(synth.name);
						onDismiss();
					}}
				>
					<div>{synth.name}</div>
					<div>{exchangeRates && exchangeRates[synth.name]}</div>
				</FlexDivRowCentered>
			))}
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 384px;
	}
	.card-body {
		max-height: 80vh;
		overflow: auto;
	}
`;

export default SelectSynthModal;
