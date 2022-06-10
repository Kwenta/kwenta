import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Slider from 'react-slick';

import { CenteredModal } from 'sections/shared/modals/common';
import { FlexDiv, Paragraph } from 'styles/common';
import media, { breakpoints } from 'styles/media';

type HowItWorksModalProps = {
	onDismiss: () => void;
};

export const HowItWorksModal: FC<HowItWorksModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();

	return (
		<StyledCenteredModal
			isOpen={true}
			onDismiss={onDismiss}
			title={t('dashboard.onboard.how-it-works-modal.title')}
		>
			<Container>
				<SubHeader>{t('homepage.steps.title')}</SubHeader>
				<SliderContainer>
					<Slider
						arrows={false}
						dots={true}
						fade={true}
						responsive={[
							{
								breakpoint: breakpoints.md,
								settings: {
									fade: false,
								},
							},
						]}
					></Slider>
				</SliderContainer>
			</Container>
		</StyledCenteredModal>
	);
};

const StyledCenteredModal = styled(CenteredModal)`
	[data-reach-dialog-content] {
		max-width: 730px;
		width: unset;
	}
	.card-body {
		padding: 75px;
		${media.lessThan('md')`
			padding: 24px;
		`}
	}
`;

const SliderContainer = styled.div`
	max-width: 320px;
	.slick-dots {
		li {
			margin: 0 2px;
			button:before {
				color: ${(props) => props.theme.colors.goldColors.color1};
				font-size: 9px;
				opacity: 0.5;
			}
			&.slick-active {
				button:before {
					color: ${(props) => props.theme.colors.goldColors.color1};
					opacity: 1;
				}
			}
		}
		bottom: unset;
		top: 90px;
		text-align: right;
		${media.lessThan('md')`
			position: unset;
			margin-top: 40px;
			text-align: center;
			top: unset;
		`}
	}
	* {
		outline: none;
	}
`;

const Container = styled(FlexDiv)`
	${media.lessThan('md')`
		flex-direction: column;
	`}
`;

const SubHeader = styled(Paragraph)`
	font-size: 32px;
	line-height: 120%;
	letter-spacing: 0.2px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	padding-right: 40px;
	${media.lessThan('md')`
		font-size: 20px;
		text-align: center;
		padding-bottom: 40px;
		padding-right: 0;
	`}
`;

export default HowItWorksModal;
