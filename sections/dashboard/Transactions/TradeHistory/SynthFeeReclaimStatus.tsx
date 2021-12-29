import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Tippy from '@tippyjs/react';
import { differenceInMinutes } from 'date-fns';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';

import { walletAddressState } from 'store/wallet';

import CircleEllipsis from 'assets/svg/app/circle-ellipsis.svg';
import CircleTick from 'assets/svg/app/circle-tick.svg';
import { SynthExchangeResult } from '@synthetixio/queries/build/node/generated/mainSubgraphQueries';
import { CurrencyKey } from '@synthetixio/contracts-interface';

const SynthFeeReclaimStatus: FC<{ trade: SynthExchangeResult }> = ({ trade }) => {
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);

	const { useFeeReclaimPeriodQuery } = useSynthetixQueries();
	const feeReclaimPeriodQuery = useFeeReclaimPeriodQuery(
		trade.toSynth?.symbol as CurrencyKey,
		walletAddress
	);
	const feeReclaimPeriodInSeconds = feeReclaimPeriodQuery.isSuccess
		? feeReclaimPeriodQuery.data ?? 0
		: 0;

	const isFreshTrade = useMemo(
		() => differenceInMinutes(new Date(), new Date(trade.timestamp.toNumber())) < 30,
		[trade.timestamp]
	); // todo: determine this by comparing toCurrencyKey trade index against numEntries returned by Exchanger.settlementOwing
	const isConfirmed = feeReclaimPeriodInSeconds === 0 || !isFreshTrade;

	return (
		<Tooltip
			placement="top"
			content={<div>{t('dashboard.transactions.table.price-adjustment-hint')}</div>}
			disabled={isConfirmed}
		>
			{isConfirmed ? (
				<ConfirmedIcon>
					<Svg src={CircleTick} />
				</ConfirmedIcon>
			) : (
				<PendingIcon>
					<Svg src={CircleEllipsis} />
				</PendingIcon>
			)}
		</Tooltip>
	);
};

export default SynthFeeReclaimStatus;

const Tooltip = styled(Tippy)`
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.white};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.navy};
	}
`;

const StatusIconMixin = `
    padding-left: 5px;
    display: inline-flex;
`;

const ConfirmedIcon = styled.span`
	${StatusIconMixin};
	color: ${(props) => props.theme.colors.green};
`;

const PendingIcon = styled.span`
	${StatusIconMixin};
	color: ${(props) => props.theme.colors.yellow};
`;
