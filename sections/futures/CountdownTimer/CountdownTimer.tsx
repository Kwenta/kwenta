import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { formatShortDateWithTime } from 'utils/formatters/date';

type Props = {
	endUtcTimestamp: number;
};

const formatTimeUnit = (value: number) => {
	return value < 10 ? '0' + value : String(value);
};

export default function CountdownTimer({ endUtcTimestamp }: Props) {
	const { t } = useTranslation();

	const calcTime = () => {
		const nowTime = new Date().getTime();
		const nowSeconds = nowTime / 1000;
		const remaining = endUtcTimestamp / 1000 - nowSeconds;
		const hours = Math.floor(remaining / 3600);
		const minutes = Math.floor((remaining - hours * 3600) / 60);
		const seconds = Math.floor(remaining - (hours * 3600 + minutes * 60));

		return {
			hours: formatTimeUnit(hours),
			minutes: formatTimeUnit(minutes),
			seconds: formatTimeUnit(seconds),
		};
	};

	const [time, setTime] = useState<{ hours: string; minutes: string; seconds: string }>(calcTime());
	const endDate = new Date(endUtcTimestamp);
	const date = new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60 * 1000);
	const endTimeLabel = formatShortDateWithTime(date);

	useEffect(() => {
		const interval = setInterval(() => setTime(calcTime()), 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<Container>
			<CountdownTime>
				{time.hours}:{time.minutes}:{time.seconds}
			</CountdownTime>
			<FinishTime>
				{t('futures.hero.countdown.endMessage')} {endTimeLabel} UTC
			</FinishTime>
		</Container>
	);
}

const Container = styled.div`
	padding: 14px 20px 0 20px;
`;

const CountdownTime = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 34px;
	font-weight: 300;
	color: #fff;
	line-height: 38px;
	margin-bottom: 12px;
`;

const FinishTime = styled.div`
	color: ${(props) => props.theme.colors.silver};
`;
