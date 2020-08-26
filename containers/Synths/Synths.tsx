import { useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useSetRecoilState } from 'recoil';
import keyBy from 'lodash/keyBy';
import produce from 'immer';

import { synthsMapState, SynthDefinitionMap } from 'store/synths';

import Contracts from 'containers/Contracts';
import useFrozenSynthsQuery from './useFrozenSynthsQuery';

const useSynths = () => {
	const { snxJS } = Contracts.useContainer();
	const frozenSynthsQuery = useFrozenSynthsQuery();

	const setSynthsMap = useSetRecoilState(synthsMapState);

	useEffect(() => {
		if (snxJS) {
			setSynthsMap(keyBy(snxJS.synths, 'name') as SynthDefinitionMap);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [snxJS]);

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

	return {
		frozenSynthsQuery,
	};
};

const Synths = createContainer(useSynths);

export default Synths;
