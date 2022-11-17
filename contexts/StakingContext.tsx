import { createContext, useContext } from 'react';

import useStakingData from 'hooks/useStakingData';

export const StakingContext = createContext<ReturnType<typeof useStakingData> | undefined>(
	undefined
);

export const useStakingContext = () => {
	const stakingContext = useContext(StakingContext);

	if (!stakingContext) throw new Error('Staking context not defined yet.');

	return stakingContext;
};
