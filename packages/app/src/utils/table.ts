import { wei } from '@synthetixio/wei'
import { Row } from '@tanstack/react-table'

export const weiSortingFn =
	<T>(key: keyof T) =>
	(rowA: Row<T>, rowB: Row<T>) => {
		const valA = rowA.original[key]
		const valB = rowB.original[key]

		const rowOne = valA ? wei(valA) : wei(0)
		const rowTwo = valB ? wei(valB) : wei(0)

		return rowOne.toNumber() > rowTwo.toNumber() ? 1 : -1
	}
