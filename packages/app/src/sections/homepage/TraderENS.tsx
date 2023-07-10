import { FC, memo } from 'react'
import styled from 'styled-components'

import useENS from 'hooks/useENS'

type TraderENSProps = {
	trader: string
	traderShort: string
	shortlist?: boolean
}

const TraderENS: FC<TraderENSProps> = memo(({ trader, traderShort, shortlist }) => {
	const { ensName, ensAvatar } = useENS(trader)

	return (
		<StyledTrader $shortlist={shortlist}>
			{ensName ? (
				<>
					{ensAvatar && (
						<img
							src={ensAvatar}
							alt={ensName}
							width={16}
							height={16}
							style={{ borderRadius: '50%', marginRight: '8px' }}
						/>
					)}
					{ensName}
				</>
			) : (
				traderShort
			)}
		</StyledTrader>
	)
})

const StyledTrader = styled.a<{ $shortlist?: boolean }>`
	color: ${(props) => props.theme.colors.white};
	display: flex;
	font-size: ${(props) => (props.$shortlist ? 15 : 13)}px;
`

export default TraderENS
