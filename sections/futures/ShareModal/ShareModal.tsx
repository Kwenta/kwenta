import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { toPng } from 'html-to-image';
import axios from 'axios';
import useSWR from 'swr';
// import { getBlobFromImageElement, copyBlobToClipboard } from 'copy-image-clipboard';

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

const fetcher = async (url: any) => {
	const res = await fetch(url);
	const data = await res.json();

	if (res.status !== 200) {
		throw new Error(data.message);
	}
	return data;
};

const ShareModal: FC<ShareModalProps> = ({
	position,
	marketAsset,
	marketAssetRate,
	setOpenShareModal,
	futuresPositionHistory,
}) => {
	const { t } = useTranslation();
	const [imagePathName, setImagePathName] = useState<string>('');
	const { data, error } = useSWR(() => `/api/handleShare`, fetcher);

	const positionDetails = position?.position ?? null;

	// const onCopyImage = () => {
	// 	const node: any = document.getElementById('pnl-graphic');

	// 	if (node) {
	// 		getBlobFromImageElement(node)
	// 			.then((blob) => {
	// 				return copyBlobToClipboard(blob);
	// 			})
	// 			.then(() => {
	// 				console.log('Blob Copied');
	// 			})
	// 			.catch((e) => {
	// 				console.log('Error: ', e.message);
	// 			});
	// 	}
	// };

	const handleShare = () => {
		let node = document.getElementById('pnl-graphic');
		if (node) {
			toPng(node, { cacheBust: true })
				.then((dataUrl: any) => {
					axios
						.post('http://localhost:3000/api/handleShare', {
							dataUrl: dataUrl,
						})
						.then((res: any) => {
							const url = 'https://v2.beta.kwenta.io';
							const via = 'kwenta_io';
							const text = 'this works!';
							if (data !== undefined) {
								console.log('data is undefined!');
							}
							const twitterURL = `https://twitter.com/intent/tweet?&text=${text}&url=${url}&via=${via}`;
							window.open(twitterURL, 'twitter');
						})
						.catch((err: any) => {
							console.log(err, 'Error trying to tweet');
						});
				})
				.catch((err: any) => {
					console.log(err);
				});
		}
	};

	return (
		<>
			<BaseModal
				onDismiss={() => setOpenShareModal(false)}
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
							marketAssetRate={marketAssetRate}
							futuresPositionHistory={futuresPositionHistory}
						/>
					</PNLGraphic>
					<ButtonContainer>
						<Button
							variant="primary"
							isRounded={true}
							onClick={handleShare}
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
