import { FC, memo } from 'react'
import styled from 'styled-components'

import useENS from 'hooks/useENS'

type TraderENSProps = {
	trader: string
	traderShort: string
}

const TraderENS: FC<TraderENSProps> = memo(({ trader, traderShort }) => {
	const { ensName, ensAvatar } = useENS(trader)

	return (
		<StyledTrader>
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

const StyledTrader = styled.a`
	color: ${(props) => props.theme.colors.white};
	display: flex;
	font-size: 15px;
`

export default TraderENS
