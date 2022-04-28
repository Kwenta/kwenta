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

	const [activeMouse, setActiveMouse] = useState(false);

	const openToolTip = () => {
		setActiveMouse(true);
	};

	const closeToolTip = () => {
		setActiveMouse(false);
	};

	const calcTime = useCallback(() => {
		const nowTime = new Date().getTime();
		let startTime = startTimeDate?.getTime() ?? nowTime;
		if (startTimeDate === undefined) startTime = nowTime;
		console.log(startTime);

		return (nowTime - startTime) / 1000;
	}, [startTimeDate])

	const [currentStartTime, setCurrentStartTime] = useState<Date>();
	const [totalSeconds, setTotalSeconds] = useState<number>( calcTime() );

	// useEffect(() => {
	// 	setCurrentStartTime(startTimeDate);
	// }, [startTimeDate]);

	useEffect(() => {
		// if (currentStartTime && (currentStartTime !== startTimeDate))
		// clearInterval(interval)
		const interval = setInterval(() => {
			setTotalSeconds(calcTime())
			console.log("activeMouse =", activeMouse)
			if(!activeMouse) clearInterval(interval)
		}, 1000);
	}, [calcTime]);

	const minutes = Math.floor(totalSeconds / 60)
	const seconds = Math.floor(totalSeconds - minutes * 60);

	let timeUnitsFormat = `exchange.market-details-card.timer-tooltip.minute-ago`;
	if (minutes > 1) timeUnitsFormat = `exchange.market-details-card.timer-tooltip.minutes-ago`;
	if (minutes < 1) timeUnitsFormat = `exchange.market-details-card.timer-tooltip.seconds-ago`;

	return (
		<Container onMouseEnter={openToolTip} onMouseLeave={closeToolTip}>
			<p>{t(`exchange.market-details-card.timer-tooltip.last-update`)}</p>
			<p>
				{`${formatTimeUnit(minutes)}:${formatTimeUnit(seconds)} `}
				{t(timeUnitsFormat)}
			</p>
		</Container>
	);
}

const Container = styled.div``;
