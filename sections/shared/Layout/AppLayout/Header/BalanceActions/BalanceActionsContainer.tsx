import styled from 'styled-components';
import { Synths } from '@synthetixio/contracts-interface';
import useSynthetixQueries from '@synthetixio/queries';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForMarkets from 'queries/futures/useGetFuturesPositionForMarkets';
import React, { FC, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { zeroBN } from 'utils/formatters/number';
import UniswapModal from 'sections/shared/modals/UniswapModal';

import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import BalanceActions from './BalanceActions';

const BalanceActionsContainer: FC = () => {
	const [uniswapWidgetOpened, setUniswapWidgetOpened] = useState<boolean>(false);
	const { t } = useTranslation();

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];
	const futuresPositionQuery = useGetFuturesPositionForMarkets(
		futuresMarkets.map(({ asset }) => asset)
	);
	const futuresPositions = futuresPositionQuery?.data ?? [];

	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	if (!sUSDBalance) {
		return null;
	}

	return (
		<Container>
			{sUSDBalance === zeroBN ? (
				<StyledButton onClick={() => setUniswapWidgetOpened(true)}>
					<StyledCurrencyIcon currencyKey={Synths.sUSD} />
					{t('header.balance.get-susd')}
				</StyledButton>
			) : (
				<BalanceActions
					futuresMarkets={futuresMarkets}
					futuresPositions={futuresPositions}
					setShowUniswapWidget={setUniswapWidgetOpened}
				/>
			)}

			{uniswapWidgetOpened && <UniswapModal onDismiss={() => setUniswapWidgetOpened(false)} />}
		</Container>
	);
};

export default BalanceActionsContainer;

const Container = styled.div``;

const StyledButton = styled(Button)`
	font-size: 13px;
	padding: 10px;
	white-space: nowrap;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	margin-right: 5px;
`;
