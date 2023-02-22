import { wei, WeiSource } from '@synthetixio/wei';
import { FC, memo, useMemo } from 'react';
import styled from 'styled-components';

import Body, { BodyProps } from './Body';

type NumericValueProps = BodyProps & {
	value: WeiSource;
	preview?: boolean;
	colored?: boolean;
};

const NumericValue: FC<NumericValueProps> = memo(({ value, preview, colored, ...props }) => {
	const color = useMemo(() => {
		if (preview) {
			return 'preview';
		} else if (colored) {
			if (wei(value).gt(0)) {
				return 'positive';
			} else if (wei(value).lt(0)) {
				return 'negative';
			}
		} else {
			return 'neutral';
		}
	}, [preview, colored, value]);

	return (
		<NumberBody mono $color={color} {...props}>
			{props.children ?? value.toString()}
		</NumberBody>
	);
});

const NumberBody = styled(Body)<{ $color: 'positive' | 'negative' | 'neutral' | 'preview' }>`
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.number[props.$color]};
`;

export default NumericValue;
