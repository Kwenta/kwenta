import React from 'react';

import useStatsData from 'hooks/useStatsData';

export const StatsContext = React.createContext<ReturnType<typeof useStatsData> | undefined>(
	undefined
);

export const useStatsContext = () => {
	const statsContext = React.useContext(StatsContext);

	if (!statsContext) throw new Error('Stats context not defined yet.');

	return statsContext;
};
