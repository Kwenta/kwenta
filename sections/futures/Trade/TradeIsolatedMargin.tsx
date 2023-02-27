import Error from 'components/ErrorView';
import Spacer from 'components/Spacer';
import { changeLeverageSide } from 'state/futures/actions';
import {
	selectFuturesAccount,
	selectFuturesType,
	selectLeverageSide,
	selectOrderType,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectPricesConnectionError } from 'state/prices/selectors';

import FeeInfoBox from '../FeeInfoBox';
import LeverageInput from '../LeverageInput';
import MarginInput from '../MarginInput';
import MarketInfoBox from '../MarketInfoBox';
import OrderPriceInput from '../OrderPriceInput';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import CreateAccount from '../TradeCrossMargin/CreateAccount';
import CrossMarginInfoBox from '../TradeCrossMargin/CrossMarginInfoBox';
import ManagePosition from './ManagePosition';
import OrderTypeSelector from './OrderTypeSelector';

type Props = {
	isMobile?: boolean;
};

const TradeIsolatedMargin = ({ isMobile }: Props) => {
	const dispatch = useAppDispatch();

	const leverageSide = useAppSelector(selectLeverageSide);
	const accountType = useAppSelector(selectFuturesType);
	const orderType = useAppSelector(selectOrderType);
	const pricesConnectionError = useAppSelector(selectPricesConnectionError);
	const account = useAppSelector(selectFuturesAccount);

	if (accountType === 'cross_margin' && !account) return <CreateAccount />;

	return (
		<div>
			{pricesConnectionError && (
				<Error message="Failed to connect to price feed. Please try disabling any ad blockers and refresh." />
			)}

			{!isMobile &&
				(accountType === 'isolated_margin' ? <MarketInfoBox /> : <CrossMarginInfoBox />)}

			<PositionButtons
				selected={leverageSide}
				onSelect={(side) => {
					dispatch(changeLeverageSide(side));
				}}
			/>

			<Spacer height={8} />
			{accountType === 'cross_margin' && <OrderTypeSelector />}

			{accountType === 'cross_margin' && <MarginInput />}

			{orderType !== 'market' && (
				<>
					<OrderPriceInput />
					<Spacer height={16} />
				</>
			)}

			<OrderSizing />

			<LeverageInput />

			<ManagePosition />

			<FeeInfoBox />
		</div>
	);
};

export default TradeIsolatedMargin;
