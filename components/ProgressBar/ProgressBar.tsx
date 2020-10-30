import { FC } from 'react';
import styled from 'styled-components';

type ProgressBarProps = {
	percentage: number;
};

const ProgressBar: FC<ProgressBarProps> = ({ percentage }) => (
	<ProgressBarWrapper>
		<Bar percentage={percentage} />
	</ProgressBarWrapper>
);

const ProgressBarWrapper = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
`;

const Bar = styled.div<{ percentage: number }>`
	height: 100%;
	width: ${(props) => props.percentage * 100}%;
	height: 4px;
	background: ${(props) => props.theme.colors.gold};
`;

export default ProgressBar;
