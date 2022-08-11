import { format } from 'date-fns';
import { FC, useState, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { useFuturesContext } from 'contexts/FuturesContext';
import { PositionHistory } from 'queries/futures/types';
import getLocale from 'utils/formatters/getLocale';
import { formatNumber, zeroBN } from 'utils/formatters/number';
import { getMarketName } from 'utils/futures';

import { PositionSide } from '../types';
import { ShareModalProps } from './ShareModal';
import ShareModalButton from './ShareModalButton';

const Separator = () => <StyledPositionDetail margin="0 1.07vw">{`|`}</StyledPositionDetail>;

interface HistoryDetailProps {
	align: 'left' | 'right';
	label: string;
	time?: string;
	content: string;
}

const HistoryDetail = ({ align, label, time, content }: HistoryDetailProps) => {
	const { t } = useTranslation();
	return (
		<HistoryDetailContainer textAlign={align}>
			<div className="subtitle label">{t(`futures.modals.share.position-metadata.${label}`)}</div>
			<div className="content">{content}</div>
			{time && <div className="time label">{time}</div>}
		</HistoryDetailContainer>
	);
};

const currencyIconStyle = {
	height: '5.09vw',
	width: 'auto',
	marginRight: '1.85vw',
};

const formatTime = (date: number, formatString: string) =>
	format(date, formatString, { locale: getLocale() });

const ShareModalMobile: FC<ShareModalProps> = ({
	position,
	marketAsset,
	setShowShareModal,
	futuresPositionHistory,
}) => {
	const marketName = getMarketName(marketAsset);
	const positionDetails = position?.position ?? null;
	const leverage = formatNumber(positionDetails?.leverage ?? zeroBN) + 'x';
	const side = positionDetails?.side === 'long' ? PositionSide.LONG : PositionSide.SHORT;
	const roiChange = positionDetails?.roiChange.mul(100);

	const amount = () => {
		if (roiChange) {
			return roiChange.gte(0)
				? `+${roiChange.toNumber().toFixed(2)}%`
				: `${roiChange.toNumber().toFixed(2)}%`;
		}
	};

	const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
	const { marketAssetRate } = useFuturesContext();

	let avgEntryPrice = '',
		openAtDate = '',
		openAtTime = '',
		createdOnDate = '',
		createdOnTime = '';

	const currentPosition = futuresPositionHistory.filter(
		(obj: PositionHistory) => obj.asset === marketAsset
	);

	avgEntryPrice = formatNumber(currentPosition[0].avgEntryPrice);

	const openTimestamp = currentPosition[0].openTimestamp;

	openAtDate = formatTime(openTimestamp, 'PP').toUpperCase();
	openAtTime = formatTime(openTimestamp, 'HH:mm:ss');
	createdOnDate = formatTime(currentTimestamp, 'PP').toUpperCase();
	createdOnTime = formatTime(currentTimestamp, 'HH:mm:ss');

	useLayoutEffect(() => {
		const now = new Date().getTime();
		setCurrentTimestamp(now);
	}, []);

	return (
		<>
			<BaseModal title="Share" isOpen onDismiss={() => setShowShareModal(false)}>
				<ModalWindow>
					<PNLGraphic id="pnl-graphic">
						<AmountContainer>
							<CurrencyIcon style={currencyIconStyle} currencyKey={marketAsset} />
							<StyledPositionDetail>{marketName}</StyledPositionDetail>
							<Separator />
							<StyledPositionDetail color={side === 'long' ? 'green' : 'red'}>
								{side.toUpperCase()}
							</StyledPositionDetail>
							<Separator />
							<StyledPositionLeverage>{leverage}</StyledPositionLeverage>
						</AmountContainer>
						<RoiContainer isGreater={roiChange?.gte(0) || true}>{amount()}</RoiContainer>
						<HistoryRow margin={'5.55vw 0 3.7vw 0'}>
							<HistoryDetail
								time={openAtTime}
								align={'right'}
								label="open-at"
								content={openAtDate}
							/>
							<HistoryDetail
								time={createdOnTime}
								align={'left'}
								label="created-on"
								content={createdOnDate}
							/>
						</HistoryRow>
						<HistoryRow>
							<HistoryDetail label="avg-open-price" content={avgEntryPrice} align={'right'} />
							<HistoryDetail
								label="current-price"
								content={formatNumber(marketAssetRate)}
								align={'left'}
							/>
						</HistoryRow>
					</PNLGraphic>
					<ShareModalButton />
				</ModalWindow>
			</BaseModal>
		</>
	);
};

export default ShareModalMobile;

const PNLGraphic = styled.div`
	width: 100%;
	height: 100%;
`;

const ModalWindow = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	// box-shadow: 0 0 0.1px ${(props) => props.theme.colors.common.primaryGold};
	width: 80vw;
	height: 40vh;
`;

const AmountContainer = styled.div`
	display: flex;
	font-size: 3.07vw;
	justify-content: center;
`;

type Color = 'green' | 'red';

const StyledPositionDetail = styled.div<{ color?: Color; margin?: string }>`
	color: ${({ theme, color }) => (color ? theme.colors[color] : theme.colors.white)};
	margin: ${(props) => props.margin || ''};
	display: flex;
	align-items: center;
`;

const StyledPositionLeverage = styled.div`
	color: ${(props) => props.theme.colors.common.primaryGold};
	display: flex;
	align-items: center;
`;

const RoiContainer = styled.div<{ isGreater: boolean }>`
	text-align: center;
	font-size: 14.35vw;
	color: ${(props) =>
		props.isGreater && props.isGreater ? props.theme.colors.green : props.theme.colors.red};
	margin-top: 3.3vw;
	text-shadow: 0px 0px 3.99vw
		${(props) =>
			props.isGreater && props.isGreater ? 'rgba(127, 212, 130, 0.35)' : 'rgb(255, 4, 32, 0.35)'};
`;

const HistoryRow = styled.div<{ margin?: string }>`
	display: flex;
	color: ${(props) => props.theme.colors.white};
	gap: 6.94vw;
	justify-content: center;
	margin: ${(props) => props.margin || ''};
	width: 100%;
`;

const HistoryDetailContainer = styled.div<{ textAlign: string }>`
	width: 100%;
	text-align: ${(props) => props.textAlign || 'left'};
	.label {
		font-family: ${(props) => props.theme.fonts.regular};
		text-transform: uppercase;
		font-size: 1.96vw;
		color: ${(props) => props.theme.colors.common.tertiaryGray};
		font-weight: 500;
	}
	.content {
		font-size: 3.7vw;
		font-weight: 700;
	}
`;
