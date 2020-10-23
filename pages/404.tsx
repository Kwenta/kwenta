import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import AppLayout from 'sections/shared/Layout/AppLayout';

import media from 'styles/media';
import { FlexDivRowCentered } from 'styles/common';

import CaretLeftXLIcon from 'assets/inline-svg/app/caret-left-xl.svg';
import CaretRightXLICon from 'assets/inline-svg/app/caret-right-xl.svg';

const NotFoundPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('not-found.page-title')}</title>
			</Head>
			<AppLayout>
				<Container>
					<Svg src={CaretLeftXLIcon} />
					<Content>
						<Title>{t('not-found.title')}</Title>
						<Subtitle>{t('not-found.subtitle')}</Subtitle>
					</Content>
					<Svg src={CaretRightXLICon} />
				</Container>
			</AppLayout>
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
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
	padding: 0 48px;
	text-align: center;
	margin-top: -10px;
`;

const Title = styled.h1`
	font-size: 120px;
	margin: 0;
	font-weight: normal;
	line-height: normal;
	${media.lessThan('sm')`
		font-size: 80px;
	`}
`;

const Subtitle = styled.h2`
	margin: 0;
	font-size: 20px;
	line-height: normal;
	font-weight: normal;
	${media.lessThan('sm')`
		font-size: 14px;
	`}
`;

export default NotFoundPage;
