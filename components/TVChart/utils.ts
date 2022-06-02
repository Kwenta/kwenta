import { ResolutionString } from 'public/static/charting_library/charting_library';

export const resolutionToSeconds = (resolution: ResolutionString): number => {
	if (!Number.isNaN(resolution)) {
		return Number(resolution) * 60;
	} else {
		const period = resolution === '1D' ? 86400 : 3600;
		return period;
	}
};
