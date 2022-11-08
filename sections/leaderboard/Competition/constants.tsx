import { CompetitionRound } from '../common';

export const getCompetitionDataLocation = (round: CompetitionRound) => {
	return `crossmargin_competition_${round}/leaderboard_latest.json`;
};
