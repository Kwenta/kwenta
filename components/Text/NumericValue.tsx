import { wei, WeiSource } from '@synthetixio/wei';
import { FC, memo, useMemo } from 'react';
import styled from 'styled-components';

import Body, { BodyProps } from './Body';

type NumericValueProps = BodyProps & {
	value: WeiSource;
	preview?: boolean;
};

const NumericValue: FC<NumericValueProps> = memo(({ value, preview, ...props }) => {
	const color = useMemo(() => {
		if (preview) {
			return 'preview';
		} else if (wei(value).gt(0)) {
			return 'positive';
		} else if (wei(value).lt(0)) {
			return 'negative';
		} else {
			return 'neutral';
		}
	}, [value, preview]);

	return (
		<NumberBody mono $color={color} {...props}>
			{value.toString()}
		</NumberBody>
	);
});

const NumberBody = styled(Body)<{ $color: 'positive' | 'negative' | 'neutral' | 'preview' }>`
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.number[props.$color]};
`;

export default NumericValue;
