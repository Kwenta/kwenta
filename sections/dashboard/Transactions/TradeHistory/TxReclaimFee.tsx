import React, { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';

import { walletAddressState } from 'store/wallet';
import { formatCryptoCurrency } from 'utils/formatters/number';

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
		<Tooltip
			placement="top"
			content={<div>{t('dashboard.transactions.table.tx-reclaim-fee-hint')}</div>}
		>
			<TxReclaimFeeLabel isPositive={fee.toNumber() < 0}>
				{formatCryptoCurrency(wei(fee), { currencyKey: trade.toCurrencyKey })}
			</TxReclaimFeeLabel>
		</Tooltip>
	);
};

export default TxReclaimFee;

const Tooltip = styled(Tippy)`
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.white};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.navy};
	}
`;

const TxReclaimFeeLabel = styled.span<{ isPositive: boolean }>`
	color: ${(props) => (props.isPositive ? props.theme.colors.green : props.theme.colors.red)};
`;
