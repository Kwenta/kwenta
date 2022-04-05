import React, { useState } from 'react';
import { Tooltip, ToolTipWrapper } from './TooltipStyles';

// Import this tooltip to a new component and customize

interface ToolTipProps {
	content?: any;
	children?: React.ReactNode;
	preset?: string;
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
}

const StyledTooltip = (props: ToolTipProps) => {
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
			{activeMouse && <Tooltip {...props}>{props.content}</Tooltip>}
		</ToolTipWrapper>
	);
};

export default StyledTooltip;
