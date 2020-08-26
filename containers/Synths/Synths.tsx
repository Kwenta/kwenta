import { useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useSetRecoilState } from 'recoil';
import produce from 'immer';

import { synthsMapState } from 'store/synths';

import useFrozenSynthsQuery from './useFrozenSynthsQuery';

const useSynths = () => {
	const frozenSynthsQuery = useFrozenSynthsQuery();

	const setSynthsMap = useSetRecoilState(synthsMapState);

	useEffect(() => {
		if (frozenSynthsQuery.isSuccess && Array.isArray(frozenSynthsQuery.data)) {
			setSynthsMap((prevSynthsMap) =>
				produce(prevSynthsMap, (draftSynthsMap) => {
					if (draftSynthsMap) {
						Object.values(draftSynthsMap).forEach((synth) => {
							draftSynthsMap[synth.name].isFrozen = frozenSynthsQuery.data.includes(synth.name);
						});
					}

					return draftSynthsMap;
				})
			);
		}
	}, [frozenSynthsQuery.isSuccess, frozenSynthsQuery.data, setSynthsMap]);

	return null;
};

export default Synths;
