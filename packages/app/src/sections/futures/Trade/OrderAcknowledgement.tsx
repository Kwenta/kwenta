import styled from 'styled-components'

import Button from 'components/Button'
import { Checkbox } from 'components/Checkbox'
import { FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'
import { setAcknowledgedOrdersWarning } from 'state/app/reducer'
import { selectAckedOrdersWarning } from 'state/app/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

type Props = {
	inContainer?: boolean
	onClick: () => void
}

export default function OrderAcknowledgement({ onClick, inContainer }: Props) {
	const dispatch = useAppDispatch()
	const checked = useAppSelector(selectAckedOrdersWarning)

	const content = (
		<ContentContainer>
			<Body color="negative">
				Conditional orders are an experimental feature and execution is not guaranteed in times of
				network congestion
			</Body>
			<Spacer height={12} />
			<FlexDivRowCentered>
				<Body color="secondary">Don't show me this again</Body>
				<Spacer width={10} />
				<Checkbox
					id="order-ack"
					label=""
					checked={checked}
					onChange={() => dispatch(setAcknowledgedOrdersWarning(!checked))}
				/>
			</FlexDivRowCentered>
			<Spacer height={12} />
			<Button data-testid="sl-tp-ack-proceed" variant="yellow" size="small" onClick={onClick}>
				Proceed
			</Button>
		</ContentContainer>
	)
	if (inContainer) {
		return <Container>{content}</Container>
	}

	return content
}

const Container = styled.div`
	padding: 50px 25px;
	background: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.secondary.background};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
`

const ContentContainer = styled.div`
	padding: 10px 15px;
	text-align: center;
	justify-content: center;
	align-items: center;
	display: flex;
	flex-direction: column;
`
