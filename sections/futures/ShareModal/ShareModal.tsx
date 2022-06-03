import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import BaseModal from 'components/BaseModal';

import AmountContainer from './AmountContainer';
import PositionMetadata from './PositionMetadata';
import ShareModalButtons from './ShareModalButtons';

import { CurrencyKey } from 'constants/currency';
import { FuturesPosition, PositionHistory } from 'queries/futures/types';

import PNLGraphicPNG from 'assets/png/pnl-graphic.png';

type ShareModalProps = {
	position: FuturesPosition | null;
	marketAsset: CurrencyKey;
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
	const positionDetails = position?.position ?? null;

	return (
		<>
			<BaseModal
				onDismiss={() => setShowShareModal(false)}
				isOpen={true}
				title={t('futures.modals.share.title')}
			>
				<ModalWindow>
					<PNLGraphic id="pnl-graphic">
						<div
							style={{
								position: 'relative',
								borderRadius: '10px',
								boxShadow: `0 0 ${
									positionDetails?.roiChange.gt(0)
										? positionDetails?.roiChange
												.mul(10) // base
												.mul(1.99) // scaling factor
												.toNumber()
												.toFixed(2)
										: 0
								}px #c9975b`,
							}}
						>
							<img
								width={'100%'}
								height={'auto'}
								src={PNLGraphicPNG}
								aria-label="pnl-graphic"
								style={{
									position: 'relative',
									borderRadius: '10px',
									border: '0px solid #c9975b',
									boxShadow: '0 0 0.1px #c9975b',
								}}
							/>
						</div>
						<AmountContainer marketAsset={marketAsset} position={position} />
						<PositionMetadata
							marketAsset={marketAsset}
							marketAssetRate={marketAssetRate}
							futuresPositionHistory={futuresPositionHistory}
						/>
					</PNLGraphic>
					<ShareModalButtons />
				</ModalWindow>
			</BaseModal>
		</>
	);
};

const PNLGraphic = styled.div`
	position: relative;
`;

const ModalWindow = styled.div`
	padding: 0px 25px;
`;

export default ShareModal;
