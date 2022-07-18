import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import BaseModal from 'components/BaseModal';

import AmountContainer from './AmountContainer';
import PositionMetadata from './PositionMetadata';
import ShareModalButton from './ShareModalButton';

import { CurrencyKey } from 'constants/currency';
import { FuturesPosition, PositionHistory } from 'queries/futures/types';

import PNLGraphicPNG from 'assets/png/pnl-graphic.png';
import { FuturesMarketAsset } from 'utils/futures';

type ShareModalProps = {
	position: FuturesPosition | null;
	marketAsset: FuturesMarketAsset;
	marketAssetRate: number;
	setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
	futuresPositionHistory: PositionHistory[];
};

const ShareModal: FC<ShareModalProps> = ({
	position,
	marketAsset,
	marketAssetRate,
	setShowShareModal,
	futuresPositionHistory,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<BaseModal
				onDismiss={() => setShowShareModal(false)}
				isOpen={true}
				title={t('futures.modals.share.title')}
			>
				<ModalWindow>
					<PNLGraphic id="pnl-graphic">
						<PNLImageFrame>
							<PNLImage src={PNLGraphicPNG} aria-label="pnl-graphic" />
						</PNLImageFrame>
						<AmountContainer position={position} />
						<PositionMetadata
							marketAsset={marketAsset}
							marketAssetRate={marketAssetRate}
							futuresPositionHistory={futuresPositionHistory}
						/>
					</PNLGraphic>
					<ShareModalButton />
				</ModalWindow>
			</BaseModal>
		</>
	);
};

const PNLImageFrame = styled.div`
	position: relative;
	border-radius: 10px;
`;

const PNLImage = styled.img`
	position: relative;

	width: 100%;
	height: auto;

	border-radius: 10px;
	border: 0px solid ${(props) => props.theme.colors.common.primaryGold};
	box-shadow: 0 0 0.5px ${(props) => props.theme.colors.common.primaryGold};
`;

const PNLGraphic = styled.div`
	position: relative;
`;

const ModalWindow = styled.div`
	padding: 0px 25px;
	box-shadow: 0 0 0.1px ${(props) => props.theme.colors.common.primaryGold};
`;

export default ShareModal;
