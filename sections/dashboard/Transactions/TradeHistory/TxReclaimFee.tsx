import React, { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';

import { walletAddressState } from 'store/wallet';
import { formatCryptoCurrency } from 'utils/formatters/number';
import { InfoTooltip } from 'styles/common';

const TxReclaimFee: FC<{ trade: Record<string, any> }> = ({ trade }) => {
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);
	const { useGetExchangeEntrySettleds } = useSynthetixQueries().subgraph;
	const feeQuery = useGetExchangeEntrySettleds(
		{
			where: { exchangeTimestamp: Math.floor(trade.timestamp / 1000), from: walletAddress },
		},
		{
			rebate: true,
			reclaim: true,
		}
	);
	const fee = feeQuery.data?.length
		? feeQuery.data[0].rebate.sub(feeQuery.data[0].reclaim)
		: wei(0);

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
