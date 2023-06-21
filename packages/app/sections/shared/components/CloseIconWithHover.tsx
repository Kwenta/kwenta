import styled from 'styled-components'

import CloseIcon from 'assets/svg/app/close-banner.svg'

type CloseIconProps = {
	width?: number
	height?: number
	onClick?: React.MouseEventHandler<SVGSVGElement>
	strokeWidth?: number
	style?: React.CSSProperties
}

const CloseIconWithHover: React.FC<CloseIconProps> = ({
	width = 10,
	height = 10,
	onClick,
	strokeWidth = 5,
	style,
}) => {
	return (
		<CloseIconWrapper
			width={width}
			height={height}
			onClick={onClick}
			strokeWidth={strokeWidth}
			style={style}
		/>
	)
}

const CloseIconWrapper = styled(CloseIcon)`
	stroke: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
	&:hover {
		stroke: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	}
`

export default CloseIconWithHover
