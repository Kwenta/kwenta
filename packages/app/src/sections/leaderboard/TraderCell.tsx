import { FC, memo } from 'react'
import styled from 'styled-components'

import TraderENS from 'sections/homepage/TraderENS'
import { getMedal } from 'utils/competition'

type TraderCellProps = {
	onClickTrader: (trader: string) => void
	compact?: boolean
	rank: number
	traderShort: string
	trader: string
}

const TraderCell: FC<TraderCellProps> = memo(
	({ onClickTrader, compact, rank, traderShort, trader }) => {
		return (
			<StyledOrderType onClick={() => onClickTrader(trader)}>
				{compact && rank + '. '}
				<TraderENS trader={trader} traderShort={traderShort} />
				{getMedal(rank)}
			</StyledOrderType>
		)
	}
)

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
	align-items: center;
`

export default TraderCell
