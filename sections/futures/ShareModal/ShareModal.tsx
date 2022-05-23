import { FC, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { toPng } from 'html-to-image';

import Button from 'components/Button';
import BaseModal from 'components/BaseModal';

import { CurrencyKey } from 'constants/currency';
import { FuturesPosition, PositionHistory } from 'queries/futures/types';

import AmountContainer from './AmountContainer';
import PositionMetadata from './PositionMetadata';
import PNLGraphicPNG from 'assets/png/pnl-graphic.png';

type ShareModalProps = {
	position: FuturesPosition | null;
	marketAsset: CurrencyKey;
	marketAssetRate: number;
	setOpenShareModal: React.Dispatch<React.SetStateAction<boolean>>;
	futuresPositionHistory: PositionHistory[];
};

const ShareModal: FC<ShareModalProps> = ({
	position,
	marketAsset,
	marketAssetRate,
	setOpenShareModal,
	futuresPositionHistory,
}) => {
	const { t } = useTranslation();
	const ref = useRef<HTMLDivElement>(null);
	const [imagePathName, setImagePathName] = useState<string>('');

	const positionDetails = position?.position ?? null;

	const onDownloadImage = useCallback(() => {
		if (ref.current === null) {
			return;
		}

		toPng(ref.current, { cacheBust: true })
			.then((dataUrl: any) => {
				const link = document.createElement('a');

				link.download = 'my-image-name.png';
				link.href = dataUrl;

				link.click();

				const pathName = link.pathname;
				setImagePathName(pathName);
				console.log('pathName', pathName);
			})
			.catch((err: any) => {
				console.log(err);
			});

		/**
		 * @todo Share to twitter and other socials
		 */
	}, [ref]);

	return (
		<>
			<BaseModal
				onDismiss={() => setOpenShareModal(false)}
				isOpen={true}
				title={t('futures.modals.share.title')}
			>
				<ModalWindow>
					<PNLGraphic ref={ref}>
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
							marketAssetRate={marketAssetRate}
							futuresPositionHistory={futuresPositionHistory}
						/>
					</PNLGraphic>
					<ButtonContainer>
						<Button
							variant="primary"
							isRounded={true}
							onClick={onDownloadImage}
							size="sm"
							disabled={false}
						>
							{t('futures.modals.share.button')}
						</Button>
					</ButtonContainer>
				</ModalWindow>
			</BaseModal>
		</>
	);
};

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;

	margin: 25px 0px 25px 0px;

	justify-content: center;
`;

const PNLGraphic = styled.div`
	position: relative;
`;

const ModalWindow = styled.div`
	padding: 0px 25px;
`;

export default ShareModal;
