import { FC } from 'react';

import styled from 'styled-components';

import { CurrencyKey } from 'constants/currency';

import BaseModal from 'components/BaseModal';
import Currency from 'components/Currency';

import ArrowsIcon from 'assets/svg/app/arrows.svg';
import { formatNumber } from 'utils/formatters/number';
import { FlexDivRowCentered } from 'styles/common';

type TxConfirmationModalProps = {
	onDismiss: () => void;
	baseCurrencyKey: CurrencyKey;
	baseCurrencyAmount: string;
	quoteCurrencyKey: CurrencyKey;
	quoteCurrencyAmount: string;
};

export const TxConfirmationModal: FC<TxConfirmationModalProps> = ({
	onDismiss,
	baseCurrencyKey,
	quoteCurrencyKey,
	baseCurrencyAmount,
	quoteCurrencyAmount,
}) => {
	return (
		<StyledBaseModal onDismiss={onDismiss} isOpen={true} title={'Confirm Transaction'}>
			<div
				style={{
					display: 'grid',
					gridAutoFlow: 'column',
					gridGap: '24px',
					paddingBottom: '24px',
					justifyContent: 'center',
				}}
			>
				<div style={{ textAlign: 'center', color: 'white' }}>
					<div style={{ paddingBottom: '8px' }}>From</div>
					<Currency.Icon currencyKey={quoteCurrencyKey} width="40px" height="40px" />
				</div>
				<div>{/* <ArrowsIcon /> */}</div>
				<div style={{ textAlign: 'center' }}>
					<div style={{ paddingBottom: '8px', color: 'white' }}>Into</div>
					<Currency.Icon currencyKey={baseCurrencyKey} width="40px" height="40px" />
				</div>
			</div>
			<div style={{ textAlign: 'center', color: '#8A939F', paddingBottom: '48px' }}>
				Confirm your transaction with your web3 provider
			</div>
			<div>
				<FlexDivRowCentered style={{ paddingBottom: '16px' }}>
					<div>{quoteCurrencyKey} Amount</div>
					<div style={{ color: 'white', fontFamily: 'AkkuratMonoLLWeb-Regular' }}>
						{formatNumber(quoteCurrencyAmount)}
					</div>
				</FlexDivRowCentered>
				<FlexDivRowCentered style={{ paddingBottom: '16px' }}>
					<div>{baseCurrencyKey} Amount</div>
					<div style={{ color: 'white', fontFamily: 'AkkuratMonoLLWeb-Regular' }}>
						{formatNumber(baseCurrencyAmount)}
					</div>
				</FlexDivRowCentered>
			</div>
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 270px;
	}
	.card-body {
	}
`;

export default TxConfirmationModal;
