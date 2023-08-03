import { FuturesMarginType } from '@kwenta/sdk/types'
import { FC } from 'react'
import styled from 'styled-components'

import FullScreenModal from 'components/FullScreenModal'
import { zIndex } from 'constants/ui'
import TradePanelCrossMargin from 'sections/futures/Trade/TradePanelCrossMargin'
import TradePanelSmartMargin from 'sections/futures/Trade/TradePanelSmartMargin'
import { selectFuturesType } from 'state/futures/common/selectors'
import { useAppSelector } from 'state/hooks'

type TradePanelDrawerProps = {
	open: boolean
	closeDrawer(): void
}
const TradePanelDrawer: FC<TradePanelDrawerProps> = ({ open, closeDrawer }) => {
	const type = useAppSelector(selectFuturesType)
	return (
		<StyledModal isOpen={open} onDismiss={closeDrawer}>
			<Background>
				<Closer onClick={closeDrawer} />
				<Foreground>
					{type === FuturesMarginType.CROSS_MARGIN ? (
						<TradePanelCrossMargin mobile closeDrawer={closeDrawer} />
					) : (
						<TradePanelSmartMargin mobile closeDrawer={closeDrawer} />
					)}
				</Foreground>
			</Background>
		</StyledModal>
	)
}

const StyledModal = styled(FullScreenModal)`
	top: 0;
	background-color: transparent;
	z-index: ${zIndex.DRAWER};

	& > div {
		margin: 0;
		height: 100%;
		width: 100%;
		max-width: 100vw;
		overflow-x: hidden;

		& > div {
			height: 100%;
			width: 100%;
		}
	}
`

const Closer = styled.div`
	flex: 1;
`

const Foreground = styled.div`
	background: ${(props) => props.theme.colors.selectedTheme.background};
	border-radius: 8px 8px 0 0;
	max-height: 80%;
`

const Background = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	background-color: rgba(0, 0, 0, 0.5);
	height: 100%;
	width: 100%;
`

export default TradePanelDrawer
