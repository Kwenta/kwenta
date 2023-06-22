import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AlertIcon from 'assets/svg/app/alert.svg'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'

type Props = {
	$mobile?: boolean
}

const CloseOnlyPrompt: React.FC<Props> = ({ $mobile }) => {
	const { t } = useTranslation()
	const theme = useTheme()

	return (
		<MessageContainer $mobile={$mobile}>
			<AlertIcon fill={theme.colors.selectedTheme.newTheme.pencilIcon.color} />
			<Spacer height={21.25} />
			<Body size="large">{t('futures.cta-buttons.close-only')}</Body>
		</MessageContainer>
	)
}

const MessageContainer = styled.div<{ $mobile?: boolean }>`
	padding: 0 30px;
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: ${(props) => (props.$mobile ? '500px' : '100%')};
	align-items: center;
`

export default CloseOnlyPrompt
