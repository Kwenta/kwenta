import { ResolutionString } from 'charting_library/charting_library'

import { TV_CHART_STATE } from './constants'

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

export const saveChartState = (state: object) => {
	window.localStorage.setItem(TV_CHART_STATE, JSON.stringify(state))
}

export const loadChartState = () => {
	const rawChartData = window.localStorage.getItem(TV_CHART_STATE)
	return rawChartData ? JSON.parse(rawChartData) : undefined
}
