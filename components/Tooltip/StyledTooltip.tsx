import React, { useState, useRef } from 'react';

import { Tooltip, ToolTipWrapper } from './TooltipStyles';

// Import this tooltip to a new component and customize

interface ToolTipProps {
	content?: any;
	children?: React.ReactNode;
	width?: string;
	height?: string;
	preset?: string;
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
	style?: React.CSSProperties;
	position?: string;
}

const StyledTooltip = (props: ToolTipProps) => {
	const [activeMouse, setActiveMouse] = useState(false);
	const [position, setPosition] = useState({});
	const myRef = useRef<HTMLDivElement>(null);

	const setFixedPosition = () => {
		if (myRef.current !== null) {
			const { left, bottom } = myRef.current.getBoundingClientRect();
			setPosition({ left: `${left}px`, top: `${bottom + 20}px` });
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
	return (
		<ToolTipWrapper ref={myRef} onMouseEnter={openToolTip} onMouseLeave={closeToolTip}>
			{props.children}
			{activeMouse && (
				<Tooltip {...position} {...props} style={props.style}>
					<p>{props.content}</p>
				</Tooltip>
			)}
		</ToolTipWrapper>
	);
};

export default StyledTooltip;
