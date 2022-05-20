import { FC } from 'react';
import { format } from 'date-fns';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import BaseModal from 'components/BaseModal';
import CurrencyIcon from 'components/Currency/CurrencyIcon';

import { CurrencyKey } from 'constants/currency';
import getLocale from 'utils/formatters/getLocale';
import { formatNumber, zeroBN } from 'utils/formatters/number';
import { FuturesPosition, PositionHistory, PositionSide } from 'queries/futures/types';

import PNLGraphicPNG from 'assets/png/pnl-graphic.png';

type ShareModalProps = {
	position: FuturesPosition | null;
	marketAsset: CurrencyKey;
	marketAssetRate: number;
	setOpenShareModal: React.Dispatch<React.SetStateAction<boolean>>;
	futuresPositionHistory: PositionHistory[];
};

const lineSeparatorStyle = { margin: '0px 0.7vw 0px 0.7vw' };
const currencyIconStyle = {
	height: '1.94vw',
	width: 'auto',
	margin: '-0.3vw 0.5vw 0vw 0vw',
};

const ShareModal: FC<ShareModalProps> = ({
	position,
	marketAsset,
	marketAssetRate,
	setOpenShareModal,
	futuresPositionHistory,
}) => {
	let avgEntryPrice: string = '',
		openAt: string = '',
		createdOn: string = '';

	if (futuresPositionHistory.length > 0) {
		avgEntryPrice = futuresPositionHistory[0]?.avgEntryPrice.toNumber().toFixed(2);

		const openTimestamp = futuresPositionHistory[0]?.openTimestamp;
		const closeTimestamp = futuresPositionHistory[0]?.timestamp;

		openAt = format(openTimestamp, 'PP', { locale: getLocale() });
		createdOn = format(closeTimestamp, 'PP', { locale: getLocale() });
	}

	const { t } = useTranslation();
	const positionDetails = position?.position ?? null;
	const leverage = formatNumber(positionDetails?.leverage ?? zeroBN) + 'x';
	const side = positionDetails?.side === 'long' ? PositionSide.LONG : PositionSide.SHORT;
	const roiChange = positionDetails?.roiChange.mul(100);
	const marketAsset__RemovedSChar = marketAsset[0] === 's' ? marketAsset.slice(1) : marketAsset;

	const amount = () => {
		if (roiChange) {
			return roiChange.gt(0)
				? `+${roiChange.toNumber().toFixed(2)}%`
				: roiChange.eq(0)
				? `+0.00%`
				: `${roiChange.toNumber().toFixed(2)}%`;
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
					<PNLGraphic>
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
						<AmountContainer>
							<StyledPositionType>
								<CurrencyIcon style={currencyIconStyle} currencyKey={marketAsset} />
								<StyledPositionDetails>{`${marketAsset__RemovedSChar}-PERP`}</StyledPositionDetails>
								<StyledPositionDetails style={lineSeparatorStyle}>{`|`}</StyledPositionDetails>
								<StyledPositionSide className={side}>{side.toUpperCase()}</StyledPositionSide>
								<StyledPositionDetails style={lineSeparatorStyle}>{`|`}</StyledPositionDetails>
								<StyledPositionLeverage>{`${leverage}`}</StyledPositionLeverage>
							</StyledPositionType>
							<StyledAmount className={side}>{amount()}</StyledAmount>
						</AmountContainer>
						<TopLeftContainer>
							<div style={{ fontSize: '0.56vw' }}>{`OPEN AT`}</div>
							<div style={{ fontSize: '1.125vw' }}>{openAt}</div>
							<div style={{ fontSize: '0.73vw' }}>{`23:21:33`}</div>
						</TopLeftContainer>
						<TopRightContainer>
							<div style={{ fontSize: '0.56vw' }}>{`CREATED ON`}</div>
							<div style={{ fontSize: '1.125vw' }}>{createdOn}</div>
							<div style={{ fontSize: '0.73vw' }}>{`23:21:33`}</div>
						</TopRightContainer>
						<BottomLeftContainer>
							<div style={{ fontSize: '0.56vw' }}>{`AVG OPEN PRICE`}</div>
							<div style={{ fontSize: '1.125vw' }}>{avgEntryPrice}</div>
						</BottomLeftContainer>
						<BottomRightContainer>
							<div style={{ fontSize: '0.56vw' }}>{`CURRENT PRICE`}</div>
							<div style={{ fontSize: '1.125vw' }}>{marketAssetRate.toFixed(2)}</div>
						</BottomRightContainer>
					</PNLGraphic>
				</ModalWindow>
			</BaseModal>
		</>
	);
};

const TopRightContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	bottom: 5.5vw;
	left: 12.02vw;
`;

const TopLeftContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	bottom: 5.5vw;
	left: 2.02vw;
`;

const BottomRightContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	bottom: 2vw;
	left: 12.02vw;
`;

const BottomLeftContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	bottom: 2vw;
	left: 2.02vw;
`;

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
	color: ${(props) => (props.className === 'long' ? '#7fd482' : '#ff0420')};

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

/** @todo Import and use correct fonts from Figma design */
const StyledAmount = styled.div`
	position: absolute;
	margin-top: -0.05vw;

	font-size: 4.8vw;
	font-weight: 700;
	color: ${(props) => (props.className && parseFloat(props.className) > 0 ? '#7fd482' : '#ff0420')};

	text-shadow: 0px 0px 3.99vw
		${(props) =>
			props.className && parseFloat(props.className) > 0
				? 'rgba(127, 212, 130, 0.35)'
				: 'rgb(255, 4, 32, 0.35)'};
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
