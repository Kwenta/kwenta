import { ReactElement } from 'react';
import styled from 'styled-components';

import { FlexDivRow } from 'components/layout/flex';

import InputTitle from './InputTitle';

type Props = {
	label: string | ReactElement;
	rightElement?: ReactElement;
};

export default function InputHeaderRow({ label, rightElement }: Props) {
	return (
		<Container>
			<InputTitle>{label}</InputTitle>
			{rightElement}
		</Container>
	);
}

const Container = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
	cursor: default;
`;
