import styled from 'styled-components';

const ProgressBarWrapper = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
`;

const StyledProgressBar = styled.div`
	height: 100%;
	width: 100%;
	border: 2px solid ${(props) => props.theme.colors.purple};
`;

const ProgressBar = ({ percentage }: { percentage: number }) => (
	<ProgressBarWrapper>
		<StyledProgressBar style={{ width: `${percentage}%` }} />
	</ProgressBarWrapper>
);
export default ProgressBar;
