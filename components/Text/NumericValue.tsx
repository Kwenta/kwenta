import { wei, WeiSource } from '@synthetixio/wei';
import { FC, memo, useMemo } from 'react';
import styled from 'styled-components';

import { formatNumber, FormatNumberOptions } from 'utils/formatters/number';

import Body, { BodyProps } from './Body';

type NumericValueProps = BodyProps & {
	value?: WeiSource;
	preview?: boolean;
	colored?: boolean;
	options?: FormatNumberOptions;
	suffix?: string;
};

const NumericValue: FC<NumericValueProps> = memo(
	({ value, preview, colored, options, suffix, ...props }) => {
		const color = useMemo(() => {
			if (props.color) {
				return props.color;
			} else if (preview) {
				return 'preview';
			} else if (colored && value) {
				if (wei(value).gt(0)) {
					return 'positive';
				} else if (wei(value).lt(0)) {
					return 'negative';
				}
			} else {
				return 'primary';
			}
		}, [props.color, preview, colored, value]);

		return (
			<NumberBody color={color} {...props}>
				{props.children ?? formatNumber(value, options)}
				{suffix}
			</NumberBody>
		);
	}
);

export const NumberBody = styled(Body).attrs({ mono: true })``;

export default NumericValue;
