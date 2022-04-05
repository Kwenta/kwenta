import React from 'react';
import styled from 'styled-components';
import StyledToolTip from './StyledTooltip';

// Example tooltip that imports base StyledToolTip and customizes it

interface ExampleToolTipProps {
	content?: any;
	children?: React.ReactNode;
	preset?: string;
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
}

const ExampleStyledToolTip = (props: ExampleToolTipProps) => {
	return <NewTooltipStyles {...props}>{props.children}</NewTooltipStyles>;
};

const NewTooltipStyles = styled(StyledToolTip)`
	color: purple;
`;
export default ExampleStyledToolTip;
