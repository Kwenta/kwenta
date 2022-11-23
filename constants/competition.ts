/**
 * Competitions will most start and end at 00:00 UTC on the respective days.
 * eg, if startDate is 2022/08/18, it means competition starts at 00:00 UTC 2022/08/18,  and endDate is 00:00 UTC 2022/08/22
 */
export const COMPETITION_DATES = {
	// note: month starts at 0, not 1.
	START_DATE: new Date(Date.UTC(2022, 10, 10)),
	END_DATE: new Date(Date.UTC(2022, 10, 23)),
};

export const COMPETITION_ENABLED = true;
