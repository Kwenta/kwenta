import { ResolutionString } from '../../../public/static/charting_library/charting_library'

export const resolutionToSeconds = (resolution: ResolutionString): number => {
	if (!isNaN(Number(resolution))) {
		return Number(resolution) * 60
	} else {
		const period =
			resolution === '1D'
				? 86400
				: resolution === '3D'
				? 86400 * 3
				: resolution === '7D'
				? 86400 * 7
				: resolution === '30D'
				? 86400 * 30
				: 3600
		return period
	}
}

export const getSupportedResolution = (period: number): string => {
	if (!isNaN(Number(period))) {
		const resolution = period / 60
		return resolution >= 720 ? '720' : resolution.toString()
	} else {
		return '1'
	}
}
