import { wei, WeiSource } from '@synthetixio/wei';
import { FC, memo, useMemo } from 'react';
import styled from 'styled-components';

import { formatNumber, FormatNumberOptions } from 'utils/formatters/number';

import Body, { BodyProps } from './Body';

type NumericValueProps = BodyProps & {
	value?: WeiSource;
	preview?: boolean;
	colored?: boolean;
	percent?: boolean;
	colorOverride?: 'positive' | 'negative' | 'neutral' | 'preview';
	options?: FormatNumberOptions;
};

const NumericValue: FC<NumericValueProps> = memo(
	({ value, percent, preview, colored, colorOverride, options, ...props }) => {
		const color = useMemo(() => {
			if (colorOverride) {
				return colorOverride;
			} else if (preview) {
				return 'preview';
			} else if (colored && value) {
				if (wei(value).gt(0)) {
					return 'positive';
				} else if (wei(value).lt(0)) {
					return 'negative';
				}
			} else {
				return 'neutral';
			}
		}, [colorOverride, preview, colored, value]);

		return (
			<NumberBody $color={color} {...props}>
				{props.children ?? formatNumber(value, options)}
				{percent && '%'}
			</NumberBody>
		);
	}
);

export const NumberBody = styled(Body).attrs({ mono: true })<{
	$color?: 'positive' | 'negative' | 'neutral' | 'preview';
}>`
	color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.text.number[props.$color ?? 'neutral']};
`;

export default NumericValue;
