import React, { useCallback } from 'react'

import TextToggle from 'components/TextToggle'
import { setShowTradeHistory } from 'state/futures/reducer'
import { selectShowHistory } from 'state/futures/selectors'
import { useAppSelector, useAppDispatch } from 'state/hooks'

const HistoryToggle = () => {
	const dispatch = useAppDispatch()
	const showHistory = useAppSelector(selectShowHistory)

	const handleHistoryChange = useCallback(() => {
		dispatch(setShowTradeHistory(!showHistory))
	}, [dispatch, showHistory])

	return (
		<TextToggle
			title="History"
			options={['show', 'hide']}
			selectedOption={showHistory ? 'show' : 'hide'}
			onOptionChange={handleHistoryChange}
		/>
	)
}

export default HistoryToggle
