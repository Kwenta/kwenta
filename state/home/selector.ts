import { RootState } from 'state/store';
import { unserializeMarkets } from 'utils/futures';

export const selectOptimismMarkets = (state: RootState) =>
	unserializeMarkets(state.home.optimismMarkets);
