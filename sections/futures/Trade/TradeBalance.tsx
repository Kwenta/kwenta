import { useState } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import { FlexDivRowCentered } from 'components/layout/flex';
import { Body, NumericValue } from 'components/Text';
import { setOpenModal } from 'state/app/reducer';
import {
	selectAvailableMargin,
	selectFuturesType,
	selectIdleMargin,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';

import CrossMarginInfoBox from '../TradeCrossMargin/CrossMarginInfoBox';

export default function TradeBalance() {
	const dispatch = useAppDispatch();
	const idleMargin = useAppSelector(selectIdleMargin);
	const accountType = useAppSelector(selectFuturesType);
	const availableIsolatedMargin = useAppSelector(selectAvailableMargin);

	const [expanded, setExpanded] = useState(false);

	const onClickContainer = () => {
		if (accountType === 'isolated_margin') return;
		setExpanded(!expanded);
	};

	return (
		<Container>
			<FlexDivRowCentered>
				<BalanceContainer clickable={accountType === 'cross_margin'} onClick={onClickContainer}>
					<Body color="secondary">Available Margin</Body>
					<NumericValue size="large" weight="bold">
						{accountType === 'isolated_margin'
							? formatDollars(availableIsolatedMargin)
							: formatDollars(idleMargin)}
					</NumericValue>
				</BalanceContainer>
				<Button
					onClick={() =>
						dispatch(
							setOpenModal(
								accountType === 'isolated_margin'
									? 'futures_isolated_transfer'
									: 'futures_cross_withdraw'
							)
						)
					}
					size="xsmall"
				>
					Manage
				</Button>
			</FlexDivRowCentered>

			{expanded && <DetailsContainer>{<CrossMarginInfoBox />}</DetailsContainer>}
		</Container>
	);
}

const Container = styled.div`
	width: 100%;
	padding: 13px 15px;
`;

const BalanceContainer = styled.div<{ clickable: boolean }>`
	cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
`;

const DetailsContainer = styled.div`
	margin-top: 15px;
`;
