import React, { useCallback, useEffect, useState } from 'react';
import { Tooltip, ToolTipWrapper } from './TooltipStyles';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useInterval from 'hooks/useInterval';

interface ToolTipProps {
	startTimeDate: Date | undefined;
	children?: React.ReactNode;
	width?: string;
	preset?: string;
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
}

type Props = {
	startTimeDate: Date | undefined;
};

const formatTimeUnit = (value: number) => {
	return value < 10 ? '0' + value : String(value);
};

const TimerTooltip = (props: ToolTipProps) => {
	const { t } = useTranslation();
	const [activeMouse, setActiveMouse] = useState(false);
	let stopTimer = false;

	const openToolTip = () => {
		setActiveMouse(true);
	};

	const closeToolTip = () => {
		setActiveMouse(false);
		stopTimer = true;
	};

	const startTimeDate = props.startTimeDate;

	const calcTime = useCallback(() => {
		const nowTime = new Date().getTime();
		let startTime = startTimeDate?.getTime() ?? nowTime;
		if (startTimeDate === undefined) startTime = nowTime;

		return (nowTime - startTime) / 1000;
	}, [startTimeDate]);

	const [totalSeconds, setTotalSeconds] = useState<number>(calcTime());
	const [currentStartTime, setCurrentStartTime] = useState<Date | undefined>(startTimeDate);
	const [newUpdate, setNewUpdate] = useState<Boolean>(false);

	useEffect(() => {
		if (currentStartTime !== startTimeDate) {
			setCurrentStartTime(startTimeDate);
			setNewUpdate(true);
		}
	}, [startTimeDate, newUpdate]);

	useInterval(
		() => {
			if (activeMouse || !newUpdate) {
				setTotalSeconds(calcTime());
				console.log('useInterval =', totalSeconds);
			}
		},
		1000,
		[calcTime, activeMouse, currentStartTime]
	);

	useEffect(() => {
		if (newUpdate) {
			console.log('!! newUpdate =', newUpdate);
			setNewUpdate(false);
		}
	}, [newUpdate]);

	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds - minutes * 60);

	let timeUnitsFormat = `exchange.market-details-card.timer-tooltip.minute-ago`;
	if (minutes > 1) timeUnitsFormat = `exchange.market-details-card.timer-tooltip.minutes-ago`;
	if (minutes < 1) timeUnitsFormat = `exchange.market-details-card.timer-tooltip.seconds-ago`;

	return (
		<ToolTipWrapper onMouseEnter={openToolTip} onMouseLeave={closeToolTip}>
			{props.children}
			{activeMouse && (
				<Tooltip {...props}>
					<Container>
						<p>{t(`exchange.market-details-card.timer-tooltip.last-update`)}</p>
						<p>
							{`${formatTimeUnit(minutes)}:${formatTimeUnit(seconds)} `}
							{t(timeUnitsFormat)}
						</p>
					</Container>
				</Tooltip>
			)}
		</ToolTipWrapper>
	);
};

export default TimerTooltip;

const Container = styled.div``;
