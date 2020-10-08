import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Select from 'components/Select';

import { priceCurrencyState } from 'store/app';

import { FlexDivRowCentered } from 'styles/common';

import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import useCurrencyOptions from 'hooks/useCurrencyOptions';

import { MenuModal } from '../common';

type SettingsModalProps = {
	onDismiss: () => void;
};

export const SettingsModal: FC<SettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const [priceCurrency, setPriceCurrency] = usePersistedRecoilState(priceCurrencyState);
	const currencyOptions = useCurrencyOptions();

	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.settings.title')}>
			<Options>
				<OptionRow>
					<OptionLabel>{t('modals.settings.options.currency')}</OptionLabel>
					<CurrencySelectContainer>
						<Select
							inputId="currency-options"
							formatOptionLabel={(option) => (
								<span>
									{option.value.sign} {option.value.asset}
								</span>
							)}
							options={currencyOptions}
							value={{ label: priceCurrency.asset, value: priceCurrency }}
							onChange={(option) => {
								if (option) {
									// @ts-ignore
									setPriceCurrency(option.value);
								}
							}}
						/>
					</CurrencySelectContainer>
				</OptionRow>
			</Options>
		</StyledMenuModal>
	);
};

const StyledMenuModal = styled(MenuModal)`
	[data-reach-dialog-content] {
		width: 216px;
	}
	.card-body {
		padding: 24px;
	}
`;

const Options = styled.div``;

const OptionLabel = styled.div`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;
`;

const OptionRow = styled(FlexDivRowCentered)``;

const CurrencySelectContainer = styled.div`
	width: 90px;
`;

export default SettingsModal;
