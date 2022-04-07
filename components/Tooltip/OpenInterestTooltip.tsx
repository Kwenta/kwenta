import React, { useState } from 'react';
import { Tooltip, ToolTipWrapper } from './TooltipStyles';

interface OIToolTipProps {
	longOI: string;
	children?: React.ReactNode;
	shortOI?: string;
	preset?: string;
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
}

const OpenInterestToolTip = (props: OIToolTipProps) => {
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
					<p>Long: {props.longOI}</p>
					<p>Short: {props.shortOI}</p>
				</Tooltip>
			)}
		</ToolTipWrapper>
	);
};

export default OpenInterestToolTip;
