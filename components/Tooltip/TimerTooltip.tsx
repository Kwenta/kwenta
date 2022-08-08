import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import useInterval from 'hooks/useInterval';

import { Tooltip, ToolTipWrapper } from './TooltipStyles';

interface ToolTipProps {
	startTimeDate: Date | undefined;
	children?: React.ReactNode;
	width?: string;
	preset?: string;
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
	style?: React.CSSProperties;
	position?: string;
}

const formatTimeUnit = (value: number) => {
	return value < 10 ? '0' + value : String(value);
};

const TimerTooltip = (props: ToolTipProps) => {
	const { t } = useTranslation();
	const [activeMouse, setActiveMouse] = useState(false);
	const [position, setPosition] = useState({});
	const myRef = useRef<HTMLDivElement>(null);

	const setFixedPosition = () => {
		const isFirefox = /firefox/i.test(navigator.userAgent);
		if (myRef.current !== null) {
			const { left, bottom, top } = myRef.current.getBoundingClientRect();
			if (isFirefox) {
				setPosition({ left: `${left - 24}px`, top: `${top - 36}px` });
			} else {
				setPosition({ left: `${left}px`, top: `${bottom + 20}px` });
			}
		}
	};

	const openToolTip = () => {
		setActiveMouse(true);
		if (props.position === 'fixed') {
			setFixedPosition();
		}
	};

	const closeToolTip = () => {
		setActiveMouse(false);
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
	}, [startTimeDate, currentStartTime, newUpdate]);

	useInterval(
		() => {
			if (activeMouse || !newUpdate) setTotalSeconds(calcTime());
		},
		1000,
		[calcTime, activeMouse, currentStartTime]
	);

	useEffect(() => {
		if (newUpdate) setNewUpdate(false);
	}, [newUpdate]);

	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds - minutes * 60);

	let timeUnitsFormat = `exchange.market-details-card.timer-tooltip.minute-ago`;
	if (minutes > 1) timeUnitsFormat = `exchange.market-details-card.timer-tooltip.minutes-ago`;
	if (minutes < 1) timeUnitsFormat = `exchange.market-details-card.timer-tooltip.seconds-ago`;

	return (
		<ToolTipWrapper ref={myRef} onMouseEnter={openToolTip} onMouseLeave={closeToolTip}>
			{props.children}
			{activeMouse && (
				<Tooltip {...props} {...position}>
					<Container>
						<span>{t(`exchange.market-details-card.timer-tooltip.last-update`)}</span>
						<p>
							{`${formatTimeUnit(minutes)}:${formatTimeUnit(seconds)} `}
							<span>{t(timeUnitsFormat)}</span>
						</p>
					</Container>
				</Tooltip>
			)}
		</ToolTipWrapper>
	);
};

export default TimerTooltip;

const Container = styled.div`
	p {
		font-family: ${(props) => props.theme.fonts.mono};
		span {
			font-family: ${(props) => props.theme.fonts.regular};
		}
	}
`;
