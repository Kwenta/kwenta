import { wei, WeiSource } from '@synthetixio/wei';
import { FC, memo, useMemo } from 'react';
import styled from 'styled-components';

import Body from './Body';

type NumericValueProps = {
	value: WeiSource;
};

const NumericValue: FC<NumericValueProps> = memo(({ value }) => {
	const color = useMemo(() => {
		if (wei(value).gt(0)) {
			return 'positive';
		} else if (wei(value).lt(0)) {
			return 'negative';
		} else {
			return 'neutral';
		}
	}, [value]);

	return (
		<NumberBody mono $color={color}>
			{value.toString()}
		</NumberBody>
	);
});

const NumberBody = styled(Body)<{ $color: 'positive' | 'negative' | 'neutral' }>`
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.number[props.$color]};
`;

export default NumericValue;
