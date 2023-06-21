import styled, { css } from 'styled-components';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';
import { StyleType } from 'components/SegmentedControl/SegmentedControl';

type Props = {
	options: string[];
	onSelect: (index: number) => void;
	type?: StyleType;
};

export default function SelectorButtons({ onSelect, options, type = 'pill-button' }: Props) {
	return (
		<Container $flex={type === 'pill-button'}>
			{type === 'pill-button' ? (
				<SegmentedControl onChange={onSelect} styleType={type} values={options} />
			) : (
				options.map((option, i) => (
					<Button
						capitalized={i === 0}
						bold={false}
						size="xsmall"
						key={i}
						onClick={() => onSelect(i)}
						fullWidth
					>
						{option}
					</Button>
				))
			)}
		</Container>
	);
}

const Container = styled.div<{ $flex?: boolean }>`
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	grid-gap: 10px;

	${(props) =>
		props.$flex &&
		css`
			display: flex;
			justify-content: flex-end;
			align-items: center;
		`}
`;
