import { ReactElement } from 'react';
import styled from 'styled-components';

import { FlexDivRow } from 'components/layout/flex';

import InputTitle from './InputTitle';

type Props = {
	label: string | ReactElement;
	rightElement?: ReactElement;
	disabled?: boolean;
};

export default function InputHeaderRow({ label, rightElement, disabled }: Props) {
	return (
		<Container $disabled={disabled}>
			<InputTitle>{label}</InputTitle>
			{rightElement}
		</Container>
	);
}

const Container = styled(FlexDivRow)<{ $disabled?: boolean }>`
	width: 100%;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
	cursor: default;
	opacity: ${(props) => (props.$disabled ? 0.4 : 1)};
`;
