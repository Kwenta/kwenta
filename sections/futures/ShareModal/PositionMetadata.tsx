import { FC, useLayoutEffect, useState } from 'react';
import { format } from 'date-fns';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { PositionHistory } from 'queries/futures/types';
import getLocale from 'utils/formatters/getLocale';

type PositionMetadataProps = {
	marketAsset: string;
	marketAssetRate: number;
	futuresPositionHistory: PositionHistory[];
};

const timeStyle = { fontSize: '0.83vw' };
const valueStyle = { fontSize: '1.23vw', color: '#FFFF' };
const headerStyle = { fontSize: '0.83vw', letterSpacing: '0.008vw' };

const getFontFamily = (props: any) => {
	const fontFamilyObj: any = {
		time: props.theme.fonts.regular,
		header: props.theme.fonts.compressedMedium,
		'date-or-price': props.theme.fonts.bold,
	};

	for (const key of Object.keys(fontFamilyObj)) {
		if (key === props.className) return fontFamilyObj[props.className];
	}
};

const PositionMetadata: FC<PositionMetadataProps> = ({
	marketAsset,
	marketAssetRate,
	futuresPositionHistory,
}) => {
	const { t } = useTranslation();
	const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

	let avgEntryPrice = '',
		openAtDate = '',
		openAtTime = '',
		createdOnDate = '',
		createdOnTime = '';

	const currentPosition = futuresPositionHistory.filter(
		(obj: PositionHistory) => obj.asset === marketAsset
	);

	avgEntryPrice = currentPosition[0].avgEntryPrice.toNumber().toFixed(2);

	const openTimestamp = currentPosition[0].openTimestamp;

	openAtDate = format(openTimestamp, 'PP', { locale: getLocale() });
	openAtTime = format(openTimestamp, 'HH:mm:ss', { locale: getLocale() });
	createdOnDate = format(currentTimestamp, 'PP', { locale: getLocale() });
	createdOnTime = format(currentTimestamp, 'HH:mm:ss', { locale: getLocale() });

	useLayoutEffect(() => {
		const now = new Date().getTime();
		setCurrentTimestamp(now);
	}, []);

	return (
		<>
			<TopLeftContainer>
				<ContainerText className="header" style={headerStyle}>
					{t('futures.modals.share.position-metadata.open-at')}
				</ContainerText>
				<ContainerText className="date-or-price" style={valueStyle}>
					{openAtDate.toUpperCase()}
				</ContainerText>
				<ContainerText className="time" style={timeStyle}>
					{openAtTime}
				</ContainerText>
			</TopLeftContainer>
			<TopRightContainer>
				<ContainerText className="header" style={headerStyle}>
					{t('futures.modals.share.position-metadata.created-on')}
				</ContainerText>
				<ContainerText className="date-or-price" style={valueStyle}>
					{createdOnDate.toUpperCase()}
				</ContainerText>
				<ContainerText className="time" style={timeStyle}>
					{createdOnTime}
				</ContainerText>
			</TopRightContainer>
			<BottomLeftContainer>
				<ContainerText className="header" style={headerStyle}>
					{t('futures.modals.share.position-metadata.avg-open-price')}
				</ContainerText>
				<ContainerText className="date-or-price" style={valueStyle}>
					{avgEntryPrice}
				</ContainerText>
			</BottomLeftContainer>
			<BottomRightContainer>
				<ContainerText className="header" style={headerStyle}>
					{t('futures.modals.share.position-metadata.current-price')}
				</ContainerText>
				<ContainerText className="date-or-price" style={valueStyle}>
					{marketAssetRate.toFixed(2)}
				</ContainerText>
			</BottomRightContainer>
		</>
	);
};

const ContainerText = styled.div`
	font-size: 0.82vw;
	font-weight: 100;
	color: #999999;

	text-transform: uppercase;

	width: 100%;

	font-family: ${(props) => getFontFamily(props)};
`;

const TopRightContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	width: 100%;

	bottom: 5.5vw;
	left: 12.02vw;
`;

const TopLeftContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	width: 100%;

	bottom: 5.5vw;
	left: 2.02vw;
`;

const BottomRightContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	width: 100%;

	bottom: 2vw;
	left: 12.02vw;
`;

const BottomLeftContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	width: 100%;

	bottom: 2vw;
	left: 2.02vw;
`;

export default PositionMetadata;
