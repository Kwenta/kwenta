import { useState, useRef, memo, FC, useCallback } from 'react';

import { Body } from 'components/Text';

import { BaseTooltip, ToolTipWrapper } from './BaseTooltip';

// Import this tooltip to a new component and customize

type TooltipProps = {
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
	visible?: boolean;
	mono?: boolean;
};

const Tooltip: FC<TooltipProps> = memo((props) => {
	const [activeMouse, setActiveMouse] = useState(false);
	const [position, setPosition] = useState({});
	const myRef = useRef<HTMLDivElement>(null);

	const isVisible = props.visible === undefined ? true : props.visible;

	const setFixedPosition = useCallback(() => {
		const isFirefox = /firefox/i.test(navigator.userAgent);
		if (myRef.current !== null) {
			const { left, bottom, top } = myRef.current.getBoundingClientRect();
			if (isFirefox) {
				setPosition({ left: `${left - 110}px`, top: `${top - 36}px` });
			} else {
				setPosition({ left: `${left - 130}px`, top: `${bottom + 20}px` });
			}
		}
	}, []);

	const openToolTip = useCallback(() => {
		setActiveMouse(true);
		if (props.position === 'fixed') {
			setFixedPosition();
		}
	}, [props.position, setFixedPosition]);

	const closeToolTip = useCallback(() => {
		setActiveMouse(false);
	}, []);

	return (
		<ToolTipWrapper ref={myRef} onMouseEnter={openToolTip} onMouseLeave={closeToolTip}>
			{props.children}
			{activeMouse && isVisible && (
				<BaseTooltip {...position} {...props} style={props.style}>
					<Body mono={props.mono}>{props.content}</Body>
				</BaseTooltip>
			)}
		</ToolTipWrapper>
	);
});

export default Tooltip;
