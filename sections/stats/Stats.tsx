import { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { initBarChart } from './initBarChart';

const Container = styled.div`
	@media only screen and (min-width: 600px) {
		// TODO: add media query for desktop
	}
	@media only screen and (min-width: 768px) {
		// TODO: add media query for tablet
	}
	@media only screen and (min-width: 992px) {
		// TODO: add media query for desktop
	}
	@media only screen and (min-width: 1200px) {
		// TODO: add media query for desktop
	}
`;

const StatsTitle = styled.h3`
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	font-size: 24px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-transform: uppercase;
`;

const VolumnContainer = styled.div`
	width: 345px;
	height: 380px;

	canvas {
		background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
		/* Highlight-Glow */

		box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.08),
			inset 0px 0px 20px rgba(255, 255, 255, 0.03);
		border-radius: 15px;
	}
`;

export type StatsProps = {};

export const Stats: FC<StatsProps> = () => {
	const { t } = useTranslation();

	const volumnRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		volumnRef?.current && initBarChart(volumnRef.current);
	}, [volumnRef]);

	return (
		<Container>
			<StatsTitle>{t('stats.title')}</StatsTitle>
			<VolumnContainer ref={volumnRef} />
		</Container>
	);
};
