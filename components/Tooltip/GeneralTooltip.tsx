import React, { useState } from 'react';
import { Tooltip, ToolTipWrapper } from './TooltipStyles';

interface ToolTipProps {
	contentArray?: string[];
	children?: React.ReactNode;
	preset?: string;
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
}

const GeneralTooltip = (props: ToolTipProps) => {
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
					{props.contentArray?.map((content, i) => (
						<p key={i}>{content}</p>
					))}
				</Tooltip>
			)}
		</ToolTipWrapper>
	);
};

export default GeneralTooltip;
