import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';

type Props = {
	options: string[];
	onSelect: (index: number) => void;
};

export default function SelectorButtons({ onSelect, options }: Props) {
	return (
		<Container>
			<SegmentedControl onChange={onSelect} styleType="pill-button" values={options} />
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
`;
