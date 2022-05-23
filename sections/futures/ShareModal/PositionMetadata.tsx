import { FC } from 'react';
import { format } from 'date-fns';
import styled from 'styled-components';

import { PositionHistory } from 'queries/futures/types';
import getLocale from 'utils/formatters/getLocale';

type PositioMetadataProps = {
	futuresPositionHistory: PositionHistory[];
	marketAssetRate: number;
};

const getFontFamily = (props: any) => {
	/**
	 * @todo `open-at` and `close-at` must use the `GT America` font-family
	 */
	if (props.className === 'open-at-header' || props.className === 'created-on-header')
		return props.theme.fonts.regular;
	if (
		props.className === 'open-at-date' ||
		props.className === 'avg-open-price' ||
		props.className === 'created-on-date' ||
		props.className === 'current-price'
	)
		return props.theme.fonts.monoBold;
	if (props.className === 'open-at-time' || props.className === 'created-on-time')
		return props.theme.fonts.mono;
};

const PositionMetadata: FC<PositioMetadataProps> = ({
	futuresPositionHistory,
	marketAssetRate,
}) => {
	let avgEntryPrice: string = '',
		openAtDate: string = '',
		openAtTime: string = '',
		createdOnDate: string = '',
		createdOnTime: string = '';

	if (futuresPositionHistory.length > 0) {
		avgEntryPrice = futuresPositionHistory[0]?.avgEntryPrice.toNumber().toFixed(2);

		const openTimestamp = futuresPositionHistory[0]?.openTimestamp;
		const closeTimestamp = futuresPositionHistory[0]?.timestamp;

		openAtDate = format(openTimestamp, 'PP', { locale: getLocale() });
		openAtTime = format(openTimestamp, 'HH:mm:ss', { locale: getLocale() });
		createdOnDate = format(closeTimestamp, 'PP', { locale: getLocale() });
		createdOnTime = format(closeTimestamp, 'HH:mm:ss', { locale: getLocale() });
	}

	return (
		<>
			<TopLeftContainer>
				<ContainerText className="open-at-header">{`OPEN AT`}</ContainerText>
				<ContainerText className="open-at-date" style={{ fontSize: '1.13vw', color: '#FFFF' }}>
					{openAtDate.toUpperCase()}
				</ContainerText>
				<ContainerText
					className="open-at-time"
					style={{ fontSize: '0.73vw', letterSpacing: '0.7px' }}
				>
					{openAtTime}
				</ContainerText>
			</TopLeftContainer>
			<TopRightContainer>
				<ContainerText className="created-on-header">{`CREATED ON`}</ContainerText>
				<ContainerText className="created-on-date" style={{ fontSize: '1.13vw', color: '#FFFF' }}>
					{createdOnDate.toUpperCase()}
				</ContainerText>
				<ContainerText
					className="created-on-time"
					style={{ fontSize: '0.73vw', letterSpacing: '0.7px' }}
				>
					{createdOnTime}
				</ContainerText>
			</TopRightContainer>
			<BottomLeftContainer>
				<ContainerText>{`AVG OPEN PRICE`}</ContainerText>
				<ContainerText className="avg-open-price" style={{ fontSize: '1.13vw', color: '#FFFF' }}>
					{avgEntryPrice}
				</ContainerText>
			</BottomLeftContainer>
			<BottomRightContainer>
				<ContainerText>{`CURRENT PRICE`}</ContainerText>
				<ContainerText className="current-price" style={{ fontSize: '1.13vw', color: '#FFFF' }}>
					{marketAssetRate.toFixed(2)}
				</ContainerText>
			</BottomRightContainer>
		</>
	);
};

const ContainerText = styled.div`
	font-size: 0.56vw;
	color: #999999;

	font-family: ${(props) => getFontFamily(props)};
`;

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

export default PositionMetadata;
