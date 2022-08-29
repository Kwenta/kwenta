import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CaretLeftXLIcon from 'assets/svg/app/caret-left-xl.svg';
import CaretRightXLICon from 'assets/svg/app/caret-right-xl.svg';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { FlexDivRowCentered } from 'styles/common';
import media from 'styles/media';

const NotFoundPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('not-found.page-title')}</title>
			</Head>
			<Container>
				<CaretLeftXLIcon />
				<Content>
					<Title>{t('not-found.title')}</Title>
					<Subtitle>{t('not-found.subtitle')}</Subtitle>
					<GitHashID />
				</Content>
				<CaretRightXLICon />
			</Container>
		</>
	);
};

const Container = styled(FlexDivRowCentered)`
	flex-grow: 1;
	justify-content: center;
	display: flex;
	align-items: center;
	> * {
		flex-shrink: 0;
	}
	padding: 0 20px;
	${media.lessThan('sm')`
		flex-direction: column;
		svg {
			transform: rotate(90deg);
		}
	`}
`;

const Content = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.mono};
	padding: 0 48px;
	text-align: center;
	margin-top: -10px;
`;

const Title = styled.h1`
	font-size: 120px;
	margin: 0;
	line-height: normal;
	${media.lessThan('sm')`
		font-size: 80px;
	`}
`;

const Subtitle = styled.h2`
	margin: 0;
	font-size: 20px;
	line-height: normal;
	${media.lessThan('sm')`
		font-size: 14px;
	`}
`;

export default NotFoundPage;
