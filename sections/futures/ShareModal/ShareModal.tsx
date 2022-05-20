import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import BaseModal from 'components/BaseModal';
import CurrencyIcon from 'components/Currency/CurrencyIcon';

import { FuturesPosition, PositionSide } from 'queries/futures/types';
import { CurrencyKey } from 'constants/currency';
import { formatNumber, zeroBN } from 'utils/formatters/number';

import PNLGraphicPNG from 'assets/png/pnl-graphic.png';

type ShareModalProps = {
	position: FuturesPosition | null;
	marketAsset: CurrencyKey;
	setOpenShareModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const lineSeparatorStyle = { margin: '0px 0.7vw 0px 0.7vw' };
const currencyIconStyle = {
	height: '1.94vw',
	width: 'auto',
	margin: '-0.3vw 0.5vw 0vw 0vw',
};

const ShareModal: FC<ShareModalProps> = ({ position, marketAsset, setOpenShareModal }) => {
	const { t } = useTranslation();
	const positionDetails = position?.position ?? null;
	const leverage = formatNumber(positionDetails?.leverage ?? zeroBN) + 'x';
	const side = positionDetails?.side === 'long' ? PositionSide.LONG : PositionSide.SHORT;

	const amount = () => {
		const roiChange = positionDetails?.roiChange.mul(100);
		console.log('roiChange: ', roiChange?.toString());

		if (roiChange) {
			return roiChange.gt(0)
				? `${roiChange.toNumber().toPrecision(3)}%`
				: roiChange.eq(0)
				? `+0.00%`
				: `${roiChange.toNumber().toPrecision(3)}%`;
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
					{/**
					 * @todo Modal stuff
					 */}
					<PNLGraphic>
						<img
							width={'100%'}
							height={'auto'}
							src={PNLGraphicPNG}
							aria-label="pnl-graphic"
							style={{ position: 'relative' }}
						/>
						<AmountContainer>
							<StyledPositionType>
								<CurrencyIcon style={currencyIconStyle} currencyKey={marketAsset} />
								<StyledPositionDetails>{`${marketAsset}-PERP`}</StyledPositionDetails>
								<StyledPositionDetails style={lineSeparatorStyle}>{`|`}</StyledPositionDetails>
								<StyledPositionSide>{side.toUpperCase()}</StyledPositionSide>
								<StyledPositionDetails style={lineSeparatorStyle}>{`|`}</StyledPositionDetails>
								<StyledPositionLeverage>{`${leverage}`}</StyledPositionLeverage>
							</StyledPositionType>
							<StyledAmount>{amount()}</StyledAmount>
						</AmountContainer>
					</PNLGraphic>
				</ModalWindow>
			</BaseModal>
		</>
	);
};

/** @todo Import and use correct fonts from Figma design */
const StyledPositionLeverage = styled.div`
	display: flex;
	flex-direction: column;
	color: #c9975b;

	font-size: 1.07vw;
`;

const StyledPositionSide = styled.div`
	display: flex;
	flex-direction: column;
	color: #7fd482;

	font-size: 1.07vw;
`;

const StyledPositionDetails = styled.div`
	display: flex;
	flex-direction: column;

	font-size: 1.07vw;

	color: #ffff;
`;

const StyledPositionType = styled.div`
	display: flex;
	flex-direction: row;
`;

const StyledAmount = styled.div`
	position: absolute;
	margin-top: -0.05vw;

	font-size: 6vw;
	font-weight: 700;
	color: #7fd482;

	text-shadow: 0px 0px 4vw rgba(127, 212, 130, 0.35);
`;

const AmountContainer = styled.div`
	position: absolute;
	top: 6vw;
	left: 2.02vw;
`;

const PNLGraphic = styled.div`
	position: relative;
`;

const ModalWindow = styled.div`
	padding: 0px 25px;
`;

export default ShareModal;
