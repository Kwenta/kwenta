import React, { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { SynthExchangeExpanded } from '@synthetixio/data/build/node/src/types';
import { wei } from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';

import { walletAddressState } from 'store/wallet';
import { formatCryptoCurrency } from 'utils/formatters/number';
import { InfoTooltip } from 'styles/common';

const TxReclaimFee: FC<{ trade: SynthExchangeExpanded }> = ({ trade }) => {
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);
	const { useTxReclaimFeeQuery } = useSynthetixQueries();
	const feeQuery = useTxReclaimFeeQuery(trade.timestamp / 1000, walletAddress);
	const fee = feeQuery.data ?? wei(0);
	return (
		<InfoTooltip
			placement="top"
			content={<div>{t('dashboard.transactions.table.tx-reclaim-fee-hint')}</div>}
		>
			<TxReclaimFeeLabel isPositive={fee.toNumber() < 0}>
				{formatCryptoCurrency(wei(fee), { currencyKey: trade.toCurrencyKey })}
			</TxReclaimFeeLabel>
		</InfoTooltip>
	);
};

export default TxReclaimFee;

const TxReclaimFeeLabel = styled.span<{ isPositive: boolean }>`
	color: ${(props) => (props.isPositive ? props.theme.colors.green : props.theme.colors.red)};
`;
