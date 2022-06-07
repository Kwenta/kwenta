import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivRowCentered } from 'styles/common';

import { MenuModal } from '../common';

import { OPTIONS } from './constants';

type SettingsModalProps = {
	onDismiss: () => void;
};

export const SettingsModal: FC<SettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();

	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.settings.title')}>
			<Options>
				{OPTIONS.map(({ id, label, SelectComponent }) => (
					<OptionRow key={id}>
						<OptionLabel>{t(label)}</OptionLabel>
						<CurrencySelectContainer>
							<SelectComponent />
						</CurrencySelectContainer>
					</OptionRow>
				))}
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	text-transform: capitalize;
`;

const OptionRow = styled(FlexDivRowCentered)`
	padding-bottom: 16px;
`;

const CurrencySelectContainer = styled.div`
	width: 90px;
`;

export default SettingsModal;
