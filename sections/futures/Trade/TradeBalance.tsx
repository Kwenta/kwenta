import styled from 'styled-components';

import Button from 'components/Button';
import { FlexDivRowCentered } from 'components/layout/flex';
import { Body, NumericValue } from 'components/Text';
import { setOpenModal } from 'state/app/reducer';
import { selectFuturesType, selectIdleMargin } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';

export default function TradeBalance() {
	const dispatch = useAppDispatch();
	const margin = useAppSelector(selectIdleMargin);
	const accountType = useAppSelector(selectFuturesType);
	return (
		<Container>
			<FlexDivRowCentered>
				<div>
					<Body size="small" color="secondary">
						Available Margin
					</Body>
					<NumericValue size="large" weight="bold">
						{formatDollars(margin)}
					</NumericValue>
				</div>
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
		</Container>
	);
}

const Container = styled.div`
	width: 100%;
	padding: 15px;
`;
