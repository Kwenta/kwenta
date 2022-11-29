import { createSelector } from '@reduxjs/toolkit';

import { getEpochDetails, parseEpochData } from 'queries/staking/utils';
import { RootState } from 'state/store';
import { toWei } from 'utils/formatters/number';

export const selectKwentaBalance = createSelector(
	(state: RootState) => state.staking.kwentaBalance,
	toWei
);

export const selectVKwentaBalance = createSelector(
	(state: RootState) => state.staking.vKwentaBalance,
	toWei
);

export const selectVeKwentaBalance = createSelector(
	(state: RootState) => state.staking.vKwentaBalance,
	toWei
);

export const selectEscrowedKwentaBalance = createSelector(
	(state: RootState) => state.staking.escrowedKwentaBalance,
	toWei
);

export const selectStakedEscrowedKwentaBalance = createSelector(
	(state: RootState) => state.staking.stakedEscrowedKwentaBalance,
	toWei
);

export const selectStakedKwentaBalance = createSelector(
	(state: RootState) => state.staking.stakedKwentaBalance,
	toWei
);

export const selectClaimableBalance = createSelector(
	(state: RootState) => state.staking.claimableBalance,
	toWei
);

export const selectPeriods = createSelector(
	(state: RootState) => state.staking.epochPeriod,
	(epochPeriod) => Array.from(new Array(epochPeriod + 1), (_, i) => i + 1)
);

export const selectIsKwentaTokenApproved = createSelector(
	selectKwentaBalance,
	(state: RootState) => state.staking.kwentaAllowance,
	(kwentaBalance, kwentaAllowance) => kwentaBalance.lte(kwentaAllowance)
);

export const selectIsVKwentaTokenApproved = createSelector(
	selectVKwentaBalance,
	(state: RootState) => state.staking.vKwentaAllowance,
	(vKwentaBalance, vKwentaAllowance) => vKwentaBalance.lte(vKwentaAllowance)
);

export const selectIsVeKwentaTokenApproved = createSelector(
	selectVeKwentaBalance,
	(state: RootState) => state.staking.veKwentaAllowance,
	(veKwentaBalance, veKwentaAllowance) => veKwentaBalance.lte(veKwentaAllowance)
);

export const selectResetTime = createSelector(
	(state: RootState) => state.wallet.networkId,
	(state: RootState) => state.staking.epochPeriod,
	(networkId, epochPeriod) => {
		const { epochEnd } = getEpochDetails(networkId ?? 10, epochPeriod);
		return epochEnd;
	}
);

export const selectEpochData = createSelector(
	selectPeriods,
	(state: RootState) => state.wallet.networkId,
	(periods, networkId) => periods.map((i) => parseEpochData(i, networkId))
);

export const selectSelectedEpoch = createSelector(
	(state: RootState) => state.staking.selectedEpoch,
	(state: RootState) => state.staking.epochPeriod,
	(state: RootState) => state.wallet.networkId,
	(selectedEpoch, epochPeriod, networkId) => parseEpochData(selectedEpoch ?? epochPeriod, networkId)
);
