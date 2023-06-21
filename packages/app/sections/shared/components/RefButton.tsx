import React from 'react'

import Button from 'components/Button'

const RefButton = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Button>>(
	(props, ref) => (
		<div ref={ref}>
			<Button noOutline size="medium" {...props}>
				{props.children}
			</Button>
		</div>
	)
)

export default RefButton
