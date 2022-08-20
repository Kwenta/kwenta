import { FC } from 'react';
import styled from 'styled-components';

const GitHashID: FC = () => {
	const gitID = process.env.GIT_HASH_ID!.toString();
	return <Container>{gitID}</Container>;
};

const Container = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 10px;
	color: #2b3035;

	position: absolute;
	bottom: 10px;
	left: 50%;
	transform: translate(-50%, -50%);
`;

export default GitHashID;
