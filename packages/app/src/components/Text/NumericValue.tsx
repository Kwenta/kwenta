import { formatNumber, FormatNumberOptions } from '@kwenta/sdk/utils'
import { wei, WeiSource } from '@synthetixio/wei'
import React, { FC, memo, ReactNode, useMemo } from 'react'
import styled from 'styled-components'

import Body, { BodyProps } from './Body'

type NumericValueProps = BodyProps & {
	value?: WeiSource
	preview?: boolean
	colored?: boolean
	options?: FormatNumberOptions
	suffix?: string
	children?: ReactNode
}

const NumericValue: FC<NumericValueProps> = memo(
	({ value, preview, colored, options, suffix, color, type = 'p', ...props }) => {
		const numberColor = useMemo(() => {
			if (color) {
				return color
			} else if (preview) {
				return 'preview'
			} else if (colored && value) {
				if (wei(value).gt(0)) {
					return 'positive'
				} else if (wei(value).lt(0)) {
					return 'negative'
				}
			} else {
				return 'primary'
			}
		}, [color, preview, colored, value])

		return (
			<Body type={type} mono color={numberColor} {...props}>
				{props.children ?? formatNumber(value, options)}
				{suffix}
			</Body>
		)
	}
)

export const NumberBody = styled(Body).attrs({ mono: true })``

export default NumericValue
