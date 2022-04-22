import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

type Props = {
	startTimeDate: Date | undefined;
};

const formatTimeUnit = (value: number) => {
	return value < 10 ? '0' + value : String(value);
};

export default function CountUpTimer({ startTimeDate }: Props) {
	const { t } = useTranslation();

	const calcTime = useCallback(() => {
		const nowTime = new Date().getTime();
		let startTime = startTimeDate?.getTime() ?? nowTime;
		if (startTimeDate === undefined) startTime = nowTime;

		const nowSeconds = nowTime / 1000;
		const timeSince = nowSeconds - startTime / 1000;
		const hours = Math.floor(timeSince / 3600);
		const minutes = Math.floor((timeSince - hours * 3600) / 60);
		const seconds = Math.floor(timeSince - (hours * 3600 + minutes * 60));

		return {
			hours: formatTimeUnit(hours),
			minutes: formatTimeUnit(minutes),
			seconds: formatTimeUnit(seconds),
		};
	}, [startTimeDate]);

	const [time, setTime] = useState<{ hours: string; minutes: string; seconds: string }>(calcTime());
	let timeUnitsFormat = `exchange.market-details-card.timer-tooltip.minute-ago`;
	if (parseInt(time.minutes) > 1)
		timeUnitsFormat = `exchange.market-details-card.timer-tooltip.minutes-ago`;
	if (parseInt(time.minutes) < 1)
		timeUnitsFormat = `exchange.market-details-card.timer-tooltip.seconds-ago`;

	useEffect(() => {
		const interval = setInterval(() => setTime(calcTime()), 1000);

		return () => {
			clearInterval(interval);
		};
	}, [calcTime]);

	return (
		<Container>
			<p>{t(`exchange.market-details-card.timer-tooltip.last-update`)}</p>
			<p>
				{`${time.minutes}:${time.seconds} `}
				{t(timeUnitsFormat)}
			</p>
		</Container>
	);
}

const Container = styled.div``;
