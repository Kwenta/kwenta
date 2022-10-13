import { FC, memo } from 'react';
import styled from 'styled-components';

const GitHashID: FC = memo(() => {
	const gitID = process.env.GIT_HASH_ID!.toString();

	return (
		<div>
			<br />
			<Container>{gitID}</Container>
		</div>
	);
});

const Container = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 10px;
	color: #2b3035;

	position: absolute;
	bottom: 0px;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 1000;
`;

export default GitHashID;
