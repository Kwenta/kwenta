import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';

import BaseModal from 'components/BaseModal';
import Select from 'components/Select';

import synthetix from 'lib/synthetix';

import { priceCurrencyState } from 'store/app';
import { HEADER_HEIGHT } from 'constants/ui';
import { SYNTHS_MAP } from 'constants/currency';

import { FlexDivRowCentered } from 'styles/common';

import { networkState } from 'store/wallet';

type SettingsModalProps = {
	onDismiss: () => void;
};

const PRICE_CURRENCIES = [
	SYNTHS_MAP.sUSD,
	SYNTHS_MAP.sEUR,
	SYNTHS_MAP.sCHF,
	SYNTHS_MAP.sAUD,
	SYNTHS_MAP.sJPY,
	SYNTHS_MAP.sGBP,
	SYNTHS_MAP.sBTC,
	SYNTHS_MAP.sETH,
];

export const SettingsModal: FC<SettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const network = useRecoilValue(networkState);
	const [priceCurrency, setPriceCurrency] = useRecoilState(priceCurrencyState);

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
		<StyledBaseModal onDismiss={onDismiss} isOpen={true} title={t('modals.settings.title')}>
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
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 216px;
		margin-left: auto;
		padding: 0;
		margin-right: 12px;
		margin-top: calc(${HEADER_HEIGHT} + 10px);
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
