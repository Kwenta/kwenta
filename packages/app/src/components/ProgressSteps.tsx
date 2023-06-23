import { FC, memo } from 'react'
import styled from 'styled-components'

type Props = {
	step: number
	totalSteps: number
	complete?: boolean
}

const ProgressSteps: FC<Props> = memo(({ step, totalSteps, complete }) => {
	const stepList = [...Array(totalSteps)]
	return (
		<div>
			<Container>
				{stepList.map((_, i) => {
					const relStep = step - 1
					return (
						<Circle
							key={i}
							status={complete || i < relStep ? 'complete' : relStep === i ? 'current' : 'pending'}
						/>
					)
				})}
				<Bar />
			</Container>
			<Labels>
				{stepList.map((_, i) => (
					<Label key={i} active={i === step - 1}>{`Step ${i + 1}`}</Label>
				))}
			</Labels>
		</div>
	)
})

const BAR_HEIGHT = 3
const CIRCLE_HEIGHT = 18

const Container = styled.div`
	height: ${CIRCLE_HEIGHT}px;
	width: 100%;
	position: relative;
	display: flex;
	justify-content: space-between;
`

const Labels = styled.div`
	display: flex;
	justify-content: space-between;
`

const Bar = styled.div`
	top: ${CIRCLE_HEIGHT / 2 - BAR_HEIGHT / 2}px;
	position: absolute;
	height: ${BAR_HEIGHT}px;
	width: 100%;
	background: ${(props) => props.theme.colors.selectedTheme.gray2};
	z-index: 1;
`

const Circle = styled.div<{ status: 'current' | 'complete' | 'pending' }>`
	z-index: 2;
	height: ${CIRCLE_HEIGHT}px;
	width: ${CIRCLE_HEIGHT}px;
	border-radius: ${CIRCLE_HEIGHT / 2}px;
	border: 3px solid ${({ theme }) => theme.colors.selectedTheme.gray2};
	background-color: ${({ theme, status }) => {
		switch (status) {
			case 'pending':
				return theme.colors.selectedTheme.background
			case 'complete':
				return theme.colors.selectedTheme.green
			case 'current':
				return theme.colors.selectedTheme.yellow
		}
	}};
`

const Label = styled.div<{ active: boolean }>`
	color: ${({ active, theme }) =>
		active ? theme.colors.selectedTheme.text.value : theme.colors.selectedTheme.gray};
	font-size: 12px;
	margin-top: 10px;
`

export default ProgressSteps
