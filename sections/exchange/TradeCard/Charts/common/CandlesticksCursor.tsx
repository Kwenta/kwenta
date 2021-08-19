import { FC } from 'react';

type Props = {
	height: number;
	width: number;
	x: number;
	y: number;
};

const CandlesticksCursor: FC<Props> = ({ height, width, x, y }) => {
	const halfWidth = width / 2;
	return (
		<path
			stroke="none"
			pointerEvents="none"
			fill="grey"
			className="recharts-rectangle recharts-tooltip-cursor"
			radius="0"
			d={`M ${x + halfWidth / 3},${y} h ${halfWidth} v ${height} h -${halfWidth} Z`}
		></path>
	);
};

export default CandlesticksCursor;
