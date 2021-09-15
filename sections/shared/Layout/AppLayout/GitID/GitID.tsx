import { FC } from 'react';
import styled from 'styled-components';

const GitID: FC = () => {
	const gitID = process.env.GIT_HASH_ID!.toString();

	return <GitIDFooter>{gitID}</GitIDFooter>;
};

const GitIDFooter = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 10px;

	left: 50%;
	transform: translate(-50%, -50%);
	position: absolute;
	bottom: 5px;

	color: #2b3035;
`;

export default GitID;
