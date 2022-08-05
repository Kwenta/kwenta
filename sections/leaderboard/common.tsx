import styled from 'styled-components';

export type Tier = 'gold' | 'silver' | 'bronze' | null;

export const getMedal = (position: number) => {
	switch (position) {
		case 1:
			return <Medal>🥇</Medal>;
		case 2:
			return <Medal>🥈</Medal>;
		case 3:
			return <Medal>🥉</Medal>;
	}
};

export const COMPETITION_TIERS: Tier[] = ['bronze', 'silver', 'gold'];

const Medal = styled.span`
	font-size: 16px;
	margin-left: 4px;
`;
