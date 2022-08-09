import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import { useFuturesContext } from 'contexts/FuturesContext';
import { FlexDivRowCentered } from 'styles/common';

type DepositMarginModalProps = {
	onDismiss(): void;
};

export default function EditLeverageModal({ onDismiss }: DepositMarginModalProps) {
	const { t } = useTranslation();

	const [leverage, setLeverage] = useState<number>(10);

	const { orderTxn } = useFuturesContext();

	const handleIncrease = () => {
		setLeverage(leverage + 1);
	};

	return (
		<StyledBaseModal
			title={t(`futures.market.trade.leverage.modal.title`)}
			isOpen
			onDismiss={onDismiss}
		>
			<BalanceText>{t('futures.market.trade.leverage.modal.balance')}:</BalanceText>

			<InputContainer
				dataTestId="futures-market-trade-leverage-modal-input"
				value={leverage}
				onChange={(_, v) => setLeverage(Number(v))}
				right={<MaxButton onClick={handleIncrease}>+</MaxButton>}
			/>

			<MarginActionButton
				data-testid="futures-market-trade-deposit-margin-button"
				fullWidth
				onClick={() => orderTxn.mutate()}
			>
				t('futures.market.trade.leverage.modal.submit')
			</MarginActionButton>

			{orderTxn.errorMessage && <ErrorView message={orderTxn.errorMessage} formatter="revert" />}
		</StyledBaseModal>
	);
}

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-top: 12px;
	margin-bottom: 8px;
	p {
		margin: 0;
	}
`;

export const BalanceText = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text};
	}
`;

const MarginActionButton = styled(Button)`
	margin-top: 16px;
	height: 55px;
	font-size: 15px;
`;

const MaxButton = styled.button`
	height: 22px;
	padding: 4px 10px;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border-radius: 11px;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	line-height: 13px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	cursor: pointer;
`;

const InputContainer = styled(CustomInput)`
	margin-bottom: 40px;
`;
