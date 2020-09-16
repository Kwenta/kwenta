import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import Select from 'components/Select';

import synthetix from 'lib/synthetix';

import { priceCurrencyState, PRICE_CURRENCIES } from 'store/app';

import { FlexDivRowCentered } from 'styles/common';

import { networkState } from 'store/wallet';

import { MenuModal } from '../common';

import { usePersistedRecoilState } from 'hooks/usePersistedRecoilState';

type SettingsModalProps = {
	onDismiss: () => void;
};

export const SettingsModal: FC<SettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const network = useRecoilValue(networkState);
	const [priceCurrency, setPriceCurrency] = usePersistedRecoilState(priceCurrencyState);

	const currencyOptions = useMemo(() => {
		if (network != null && synthetix.synthsMap != null) {
			return PRICE_CURRENCIES.filter((currencyKey) => synthetix.synthsMap![currencyKey]).map(
				(currencyKey) => {
					const synth = synthetix.synthsMap![currencyKey];
					return {
						label: synth.asset,
						value: synth,
					};
				}
			);
		}
		return [];
	}, [network]);

	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.settings.title')}>
			<Options>
				<OptionRow>
					<OptionLabel>{t('modals.settings.options.currency')}</OptionLabel>
					<CurrencySelectContainer>
						<Select
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
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;
`;

const OptionRow = styled(FlexDivRowCentered)``;

const CurrencySelectContainer = styled.div`
	width: 90px;
`;

export default SettingsModal;
