import { format } from 'date-fns';
import { FC, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { useFuturesContext } from 'contexts/FuturesContext';
import { selectFuturesType } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { positionHistoryState } from 'store/futures';
import getLocale from 'utils/formatters/getLocale';
import { formatDollars, zeroBN } from 'utils/formatters/number';

type PositionMetadataProps = {
	marketAsset: string;
};

function getColor(props: any) {
	let color = '';

	switch (props.className) {
		case 'header':
			color = props.theme.colors.common.tertiaryGray;
			break;
		case 'time':
			color = props.theme.colors.common.tertiaryGray;
			break;
		case 'date-or-price':
			color = props.theme.colors.white;
			break;

		default:
			color = props.theme.colors.common.tertiaryGray;
	}

	return color;
}

function getFontSize(props: any) {
	let fontSize = '';

	switch (props.className) {
		case 'header':
			fontSize = '0.83vw';
			break;
		case 'time':
			fontSize = '0.83vw';
			break;
		case 'date-or-price':
			fontSize = '1.23vw';
			break;

		default:
			fontSize = '0.83vw';
	}

	return fontSize;
}

function getFontFamily(props: any) {
	const fontFamilyObj: any = {
		time: props.theme.fonts.regular,
		header: props.theme.fonts.compressedMedium,
		'date-or-price': props.theme.fonts.bold,
	};

	for (const key of Object.keys(fontFamilyObj)) {
		if (key === props.className) return fontFamilyObj[props.className];
	}
}

const PositionMetadata: FC<PositionMetadataProps> = ({ marketAsset }) => {
	const { t } = useTranslation();
	const [currentTimestamp, setCurrentTimestamp] = useState(0);

	const { marketAssetRate } = useFuturesContext();
	const futuresPositionHistory = useRecoilValue(positionHistoryState);
	const futuresAccountType = useAppSelector(selectFuturesType);

	let avgEntryPrice = '',
		openAtDate = '',
		openAtTime = '',
		createdOnDate = '',
		createdOnTime = '';

	const currentPosition = futuresPositionHistory[futuresAccountType].find(
		(position) => position.isOpen && position.asset === marketAsset
	);

	avgEntryPrice = currentPosition?.avgEntryPrice.toNumber().toString() ?? '';
	const openTimestamp = currentPosition?.openTimestamp ?? 0;

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
				<ContainerText className="header">
					{t('futures.modals.share.position-metadata.open-at')}
				</ContainerText>
				<ContainerText className="date-or-price">{openAtDate.toUpperCase()}</ContainerText>
				<ContainerText className="time">{openAtTime}</ContainerText>
			</TopLeftContainer>
			<TopRightContainer>
				<ContainerText className="header">
					{t('futures.modals.share.position-metadata.created-on')}
				</ContainerText>
				<ContainerText className="date-or-price">{createdOnDate.toUpperCase()}</ContainerText>
				<ContainerText className="time">{createdOnTime}</ContainerText>
			</TopRightContainer>
			<BottomLeftContainer>
				<ContainerText className="header">
					{t('futures.modals.share.position-metadata.avg-open-price')}
				</ContainerText>
				<ContainerText className="date-or-price">
					{formatDollars(avgEntryPrice ?? zeroBN, {
						isAssetPrice: true,
					})}
				</ContainerText>
			</BottomLeftContainer>
			<BottomRightContainer>
				<ContainerText className="header">
					{t('futures.modals.share.position-metadata.current-price')}
				</ContainerText>
				<ContainerText className="date-or-price">
					{formatDollars(marketAssetRate ?? '', { isAssetPrice: true })}
				</ContainerText>
			</BottomRightContainer>
		</>
	);
};

const ContainerText = styled.div`
	font-size: ${(props) => getFontSize(props)};
	font-weight: 100;
	color: ${(props) => getColor(props)};

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
