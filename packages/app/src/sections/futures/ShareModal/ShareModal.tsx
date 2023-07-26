import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { FuturesPositionTablePosition } from 'types/futures'

import MobilePNLGraphicPNG from 'assets/png/mobile-pnl-graphic.png'
import PNLGraphicPNG from 'assets/png/pnl-graphic.png'
import BaseModal from 'components/BaseModal'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import media from 'styles/media'

import AmountContainer from './AmountContainer'
import PositionMetadata from './PositionMetadata'
import ShareModalButton from './ShareModalButton'

type ShareModalProps = {
	sharePosition: FuturesPositionTablePosition
	setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>
}

const ShareModal: FC<ShareModalProps> = ({ sharePosition, setShowShareModal }) => {
	const { t } = useTranslation()

	return (
		<>
			<BaseModal
				onDismiss={() => setShowShareModal(false)}
				isOpen
				title={t('futures.modals.share.title')}
			>
				<ModalWindow>
					<PNLGraphic id="pnl-graphic">
						<PNLImageFrame>
							<DesktopOnlyView>
								<PNLImage src={PNLGraphicPNG} aria-label="pnl-graphic" />
							</DesktopOnlyView>
							<MobileOrTabletView>
								<PNLImage src={MobilePNLGraphicPNG} aria-label="pnl-graphic" />
							</MobileOrTabletView>
						</PNLImageFrame>
						<AmountContainer position={sharePosition} />
						<PositionMetadata position={sharePosition} />
					</PNLGraphic>
					<ShareModalButton position={sharePosition} />
				</ModalWindow>
			</BaseModal>
		</>
	)
}

const PNLImageFrame = styled.div`
	position: relative;
	border-radius: 10px;
`

const PNLImage = styled.img`
	position: relative;

	width: 100%;
	height: auto;

	border-radius: 10px;
	border: 0px solid ${(props) => props.theme.colors.common.primaryGold};
	box-shadow: 0 0 0.5px ${(props) => props.theme.colors.common.primaryGold};
`

const PNLGraphic = styled.div`
	position: relative;
`

const ModalWindow = styled.div`
	padding: 0px 25px;
	box-shadow: 0 0 0.1px ${(props) => props.theme.colors.common.primaryGold};

	${media.lessThan('md')`
		padding: 0px 12px;
	`}
`

export default ShareModal
