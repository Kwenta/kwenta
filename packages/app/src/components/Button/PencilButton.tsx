import styled, { useTheme } from 'styled-components'

import PencilIcon from 'assets/svg/app/pencil.svg'

export type PencilButtonProps = {
	width?: number
	height?: number
	style?: React.CSSProperties
	fill?: string
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined
}

const PencilButton: React.FC<PencilButtonProps> = ({ ...props }) => {
	const theme = useTheme()
	return (
		<PencilIconWithHover fill={theme.colors.selectedTheme.newTheme.pencilIcon.color} {...props} />
	)
}

const PencilIconWithHover = styled(PencilIcon)`
	cursor: pointer;
	margin-left: 10px;

	&:hover {
		fill: ${({ theme }) => theme.colors.selectedTheme.newTheme.pencilIcon.hover.color};
	}
`

export default PencilButton
