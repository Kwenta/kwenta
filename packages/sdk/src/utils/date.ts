import differenceInSeconds from 'date-fns/differenceInSeconds'
import formatDate from 'date-fns/format'
import getISOWeeksInYear from 'date-fns/getISOWeeksInYear'
import subHours from 'date-fns/subHours'

import { strPadLeft } from './string'

export const formatTxTimestamp = (timestamp: number | Date) =>
	formatDate(timestamp, 'MMM d, yy | HH:mm')

export const toJSTimestamp = (timestamp: number) => timestamp * 1000

export const formatShortDate = (date: Date | number) => formatDate(date, 'yyyy-MM-dd')

export const formatChartTime = (date: Date | number) => formatDate(date, 'E, h a')

export const formatChartDate = (date: Date | number) => formatDate(date, 'M/d')

export const formatShortDateUTC = (date: Date | number) => {
	const dateString = new Date(date).toISOString()
	return dateString.substring(0, 10)
}

export const formatShortDateWithTime = (date: Date | number) =>
	formatDate(date, 'MMM d, yyyy h:mm a')
export const formatDateWithTime = (date: Date | number) => formatDate(date, 'd MMM yyyy H:mm')

export const secondsToTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60)
	const secondsLeft = seconds - minutes * 60

	return `${strPadLeft(minutes, '0', 2)}:${strPadLeft(secondsLeft, '0', 2)}`
}

export const WEEKS_IN_YEAR = getISOWeeksInYear(new Date())

export const calculateTimestampForPeriod = (periodInHours: number) =>
	Math.trunc(subHours(new Date().getTime(), periodInHours).getTime())

export const formatDateWithoutYear = (date: Date) => formatDate(date, 'MMMM dd')

export const formatShortDateWithoutYear = (date: Date) => formatDate(date, 'M/dd')

export const calculatedTimeDifference = (dateLeft: Date, dateRight: Date) =>
	differenceInSeconds(dateLeft, dateRight)

export const keepDoublePlaceholder = (num: number) => (num < 9 ? `0${num}` : num)

export const formatTimer = (seconds: number) => {
	const numMinutes = Math.floor(seconds / 60)
	const numSeconds = seconds % 60
	return `${numMinutes}:${String(numSeconds).padStart(2, '0')}`
}

export const truncateTimestamp = (timestamp: number, delta: number): number => {
	return Math.floor(timestamp / delta) * delta
}

export const formatTruncatedDuration = (delta: number): string => {
	const days = Math.floor(delta / 86400)
	delta -= days * 86400
	const hours = Math.floor(delta / 3600) % 24
	delta -= hours * 3600
	const minutes = Math.floor(delta / 60) % 60
	delta -= minutes * 60
	const daysStr = days > 0 ? days + 'd' : '0d'
	const hoursStr = hours > 0 ? hours + 'h' : '0h'
	const minsStr = minutes > 0 ? minutes + 'm' : '0m'
	return days > 10 ? `${daysStr}:${hoursStr}`.trim() : `${daysStr}:${hoursStr}:${minsStr}`.trim()
}

export const getNextSunday = (date: Date) => {
	const nextSunday = new Date()
	nextSunday.setDate(date.getDate() + (7 - date.getDay()))
	nextSunday.setHours(0, 0, 0, 0)
	return nextSunday
}

export const hoursToMilliseconds = (hours: number) => hours * 60 * 60 * 1000
