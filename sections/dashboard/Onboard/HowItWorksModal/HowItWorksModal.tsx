import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Slider from 'react-slick';

import { CenteredModal } from 'sections/shared/modals/common';
import { FlexDiv, Paragraph } from 'styles/common';
import media, { breakpoints } from 'styles/media';

import { STEPS } from 'sections/homepage/Steps';

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
					>
						{STEPS.map(({ id, image, subtitle, title, copy }) => (
							<div key={id}>
								<StepBox>
									{image}
									<StepSubtitle>{t(subtitle)}</StepSubtitle>
								</StepBox>
								<StepTitle>{t(title)}</StepTitle>
								<StepCopy>{t(copy)}</StepCopy>
							</div>
						))}
					</Slider>
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

const StepBox = styled.div`
	position: relative;
	margin-bottom: 20px;
`;

const StepSubtitle = styled(Paragraph)`
	font-size: 16px;
	line-height: 120%;
	color: ${(props) => props.theme.colors.goldColors.color1};
	font-family: ${(props) => props.theme.fonts.bold};
	position: absolute;
	bottom: 2px;
`;

const StepTitle = styled(Paragraph)`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	padding-bottom: 12px;
	line-height: 19.2px;
`;

const StepCopy = styled(Paragraph)`
	color: ${(props) => props.theme.colors.silver};
	${media.lessThan('md')`
		font-size: 14px;
		line-height: 20px;
	`}
`;

export default HowItWorksModal;
