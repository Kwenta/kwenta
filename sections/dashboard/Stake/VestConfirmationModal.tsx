import Wei from '@synthetixio/wei';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import Spacer from 'components/Spacer';
import { EXTERNAL_LINKS } from 'constants/links';
import { ExternalLink, FlexDivRowCentered } from 'styles/common';
import { truncateNumbers } from 'utils/formatters/number';

type Props = {
	onDismiss(): void;
	totalFee: Wei;
	handleVest(): void;
};

const VestConfirmationModal: React.FC<Props> = ({ onDismiss, totalFee, handleVest }) => {
	const { t } = useTranslation();
	const LinkText = () => {
		return (
			<ExternalLink href={EXTERNAL_LINKS.Docs.Staking}>
				<b>{t('dashboard.stake.tabs.escrow.modal.more-info')}</b>
			</ExternalLink>
		);
	};

	return (
		<StyledBaseModal
			title={t('dashboard.stake.tabs.escrow.modal.title')}
			isOpen
			onDismiss={onDismiss}
		>
			<MinimumAmountDisclaimer>
				<Trans i18nKey="dashboard.stake.tabs.escrow.modal.warning" components={[<LinkText />]} />
			</MinimumAmountDisclaimer>

			<Spacer height={5} />

			<BalanceContainer>
				<BalanceText $gold>
					<Trans
						i18nKey="dashboard.stake.tabs.escrow.modal.confirm-text"
						values={{ totalFee: truncateNumbers(totalFee, 4) }}
						components={[<Emphasis />]}
					/>
				</BalanceText>
			</BalanceContainer>

			<Spacer height={20} />

			<VestConfirmButton
				data-testid="dashboard.stake.tabs.escrow.modal.confirm-button"
				variant="flat"
				disabled={false}
				fullWidth
				onClick={handleVest}
			>
				{t('dashboard.stake.tabs.escrow.modal.confirm-button')}
			</VestConfirmButton>
		</StyledBaseModal>
	);
};

const Emphasis = styled.b``;

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	p {
		margin: 0;
	}
`;

export const BalanceText = styled.p<{ $gold?: boolean }>`
	color: ${(props) =>
		props.$gold ? props.theme.colors.selectedTheme.yellow : props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`;

export const VestConfirmButton = styled(Button)`
	height: 55px;
	color: ${(props) => props.theme.colors.selectedTheme.red};
`;

export const MaxButton = styled.button`
	height: 22px;
	padding: 4px 10px;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border-radius: 11px;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	line-height: 13px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	cursor: pointer;
`;

const MinimumAmountDisclaimer = styled.div`
	font-size: 12px;
	margin: 20px 0;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

export default VestConfirmationModal;
