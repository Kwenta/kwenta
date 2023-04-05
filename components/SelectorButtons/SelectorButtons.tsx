import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';
import { StyleType } from 'components/SegmentedControl/SegmentedControl';

type Props = {
	options: string[];
	onSelect: (index: number) => void;
	type?: StyleType;
};

export default function SelectorButtons({ onSelect, options, type = 'pill-button' }: Props) {
	return (
		<Container>
			<SegmentedControl onChange={onSelect} styleType={type} values={options} />
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
`;
