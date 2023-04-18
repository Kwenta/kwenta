import { memo, useState } from 'react';
import styled from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg';
import Button from 'components/Button';
import { FlexDivRowCentered } from 'components/layout/flex';
import { Body, NumericValue } from 'components/Text';
import { setOpenModal } from 'state/app/reducer';
import {
	selectAvailableMargin,
	selectFuturesType,
	selectIdleMargin,
	selectWithdrawableMargin,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';

import CrossMarginInfoBox from '../TradeCrossMargin/CrossMarginInfoBox';

type TradeBalanceProps = {
	isMobile?: boolean;
};

const TradeBalance: React.FC<TradeBalanceProps> = memo(({ isMobile = false }) => {
	const dispatch = useAppDispatch();
	const idleMargin = useAppSelector(selectIdleMargin);
	const accountType = useAppSelector(selectFuturesType);
	const availableIsolatedMargin = useAppSelector(selectAvailableMargin);
	const withdrawable = useAppSelector(selectWithdrawableMargin);

	const [expanded, setExpanded] = useState(false);

	const onClickContainer = () => {
		if (accountType === 'isolated_margin') return;
		setExpanded(!expanded);
	};

	return (
		<Container>
			<FlexDivRowCentered>
				<BalanceContainer clickable={accountType === 'cross_margin'} onClick={onClickContainer}>
					<Body size={isMobile ? 'medium' : 'large'} color="secondary">
						Available Margin
						{accountType === 'cross_margin' ? expanded ? <HideIcon /> : <ExpandIcon /> : null}
					</Body>
					<NumericValue size={isMobile ? 'medium' : 'large'} weight="bold">
						{accountType === 'isolated_margin'
							? formatDollars(availableIsolatedMargin)
							: formatDollars(idleMargin)}
					</NumericValue>
				</BalanceContainer>
				{(accountType === 'isolated_margin' || withdrawable.gt(0)) && (
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
				)}
			</FlexDivRowCentered>

			{expanded && <DetailsContainer>{<CrossMarginInfoBox />}</DetailsContainer>}
		</Container>
	);
});

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

const ExpandIcon = styled(CaretDownIcon)`
	margin-left: 8px;
`;

const HideIcon = styled(ExpandIcon)`
	transform: rotate(180deg);
	margin-bottom: -4px;
`;

export default TradeBalance;
