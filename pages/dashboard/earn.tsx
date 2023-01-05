import Head from 'next/head';
import { FC, useEffect } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import * as Text from 'components/Text';
import DashboardLayout from 'sections/dashboard/DashboardLayout';
import { Heading } from 'sections/earn/common';
import StepOne from 'sections/earn/StepOne';
import StepTwo from 'sections/earn/StepTwo';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { getEarnDetails } from 'state/earn/actions';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { PageContent, FullHeightContainer, MainContent } from 'styles/common';
import media from 'styles/media';

type EarnPageProps = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const EarnPage: EarnPageProps = () => {
	const dispatch = useAppDispatch();
	const walletAddress = useAppSelector(({ wallet }) => wallet.walletAddress);

	useEffect(() => {
		dispatch(getEarnDetails(walletAddress));
	}, [dispatch, walletAddress]);

	useEffect(() => {
		const refetchEarnDetails = () => {
			dispatch(getEarnDetails(walletAddress));
		};

		window.addEventListener('focus', refetchEarnDetails);

		return () => {
			window.removeEventListener('focus', refetchEarnDetails);
		};
	}, [dispatch, walletAddress]);

	return (
		<>
			<Head>
				<title>Earn | Kwenta</title>
			</Head>
			<PageContent>
				<FullHeightContainer>
					<EarnContent>
						<Heading>Kwenta Liquidity Mining</Heading>
						<StyledBody>
							The ETH/KWENTA program rewards liquidity providers on the Uniswap v3 pool via Arrakis
							Finance. Liquidity providers can stake their pool tokens to earn KWENTA.
						</StyledBody>
						<StepOne />
						<StepTwo />
						<GitHashID />
					</EarnContent>
				</FullHeightContainer>
			</PageContent>
		</>
	);
};

EarnPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

const EarnContent = styled(MainContent)`
	${media.lessThan('mdUp')`
		padding: 15px 15px 0;
	`}
`;

const StyledBody = styled(Text.Body).attrs({ size: 'large' })`
	font-size: 15px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

export const StyledButton = styled(Button)`
	font-size: 13px;
	height: 38px;
`;

export default EarnPage;
