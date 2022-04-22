import React, { useState } from 'react';
import { Tooltip, ToolTipWrapper } from './TooltipStyles';
import CountUpTimer from '../../sections/futures/CountUpTimer';

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

const TimerTooltip = (props: ToolTipProps) => {
	const [activeMouse, setActiveMouse] = useState(false);

	const openToolTip = () => {
		setActiveMouse(true);
	};

	const closeToolTip = () => {
		setActiveMouse(false);
	};
	return (
		<ToolTipWrapper onMouseEnter={openToolTip} onMouseLeave={closeToolTip}>
			{props.children}
			{activeMouse && (
				<Tooltip {...props}>
					<CountUpTimer startTimeDate={props.startTimeDate} />
				</Tooltip>
			)}
		</ToolTipWrapper>
	);
};

export default TimerTooltip;
