import { Medal } from 'sections/leaderboard/medal'

export type CompetitionRound = '1' | '2' | null

export const getMedal = (position: number) => {
	switch (position) {
		case 1:
			return <Medal>🥇</Medal>
		case 2:
			return <Medal>🥈</Medal>
		case 3:
			return <Medal>🥉</Medal>
	}
}

export const getCompetitionDataLocation = (round: CompetitionRound) => {
	return `crossmargin_competition_${round}/leaderboard_latest.json`
}
