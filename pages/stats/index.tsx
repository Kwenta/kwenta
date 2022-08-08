import { Container } from '@material-ui/core';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { StyledCard } from 'components/BaseModal/BaseModal';
import { BigWhiteHeader } from 'sections/homepage/Features/Features';
import HomeLayout from 'sections/shared/Layout/HomeLayout';

import Background from '../../assets/png/stats/background.png';

type StatsProps = {};

const dateRangeValues = ['24H', '1W', '1M', 'MAX'];

const Stats: FC<StatsProps> = () => {
	const { t } = useTranslation();

	const HEADER_TITLE = t('stats.header').toUpperCase();
	const VOLUME_TITLE = t('stats.volume.title');

	function handleDateRange(index: number) {
		if (index === 0) {
		}
		if (index === 1) {
		}
		if (index === 2) {
		}
		if (index === 3) {
		}
	}

	return (
		<>
			<img
				src={Background}
				alt="transparent background"
				style={{ marginTop: '250px', position: 'absolute', height: '100%', width: '100%' }}
			/>
			<HomeLayout>
				<Container>
					<div style={{ display: 'flex', justifyContent: 'center' }}>
						<Header>{HEADER_TITLE}</Header>
					</div>

					<Card>
						<CardTitle>
							<p style={{ marginRight: '5px' }}>{VOLUME_TITLE}</p>
							<p style={{ color: '#787878' }}>{`(24h)`}</p>
						</CardTitle>

						<DRs>
							{dateRangeValues.map((drValue: string, index: number) => (
								<DrContainer>
									<DR onClick={(e: any) => handleDateRange(index)}>{`${drValue}`}</DR>
								</DrContainer>
							))}
						</DRs>

						<VaContainer>
							<VA>{`$40,461,472`}</VA>
							<VGP>{`-13.70%`}</VGP>
						</VaContainer>

						<RcaContainer>
							<RCA>{/* <RcaValue></RcaValue> */}</RCA>
						</RcaContainer>
					</Card>

					<div style={{ padding: '200px' }} />
				</Container>
			</HomeLayout>
		</>
	);
};

const RCA = styled.div`
	/* Auto layout */

	display: flex;
	flex-direction: column;
	align-items: flex-end;
	padding: 0px;
	gap: 40px;

	position: absolute;
	width: 80px;
	height: 331px;
	left: 1180px;
	top: 375px;
`;

// Right chart axis container
const RcaContainer = styled.div`
	width: 88px;
	height: 372px;
	left: 1180px;
	top: 375px;
`;

// Volume gain percentage
const VGP = styled.p`
	/* Amount */

	position: relative;
	width: 64px;
	height: 29px;
	top: 50%;

	/* Title/T3 - Akkurat LL - 18 */

	font-family: ${(props) => props.theme.fonts.regular};
	font-weight: 400;
	font-size: 18px;
	line-height: 150%;
	/* or 27px */

	/* Primary Red */

	color: #ef6868;

	/* Inside auto layout */

	flex: none;
	order: 1;
	flex-grow: 0;
`;

// Volume amount
const VA = styled.p`
	/* Amount */

	height: 42px;

	/* Title/T1 - Akkurat Mono LL - 28 */

	font-family: ${(props) => props.theme.fonts.mono};
	font-weight: 700;
	font-size: 28px;
	line-height: 150%;
	/* identical to box height, or 42px */

	letter-spacing: -0.05em;

	/* Primary White */

	color: ${(props) => props.theme.colors.white};

	/* Inside auto layout */

	flex: none;
	order: 0;
	flex-grow: 0;
`;

// Volume amount container
const VaContainer = styled.div`
	/* Frame 81967325 */

	/* Auto layout */

	display: flex;
	padding: 0px;
	gap: 10px;

	position: relative;
	width: 1049px;
	height: 42px;

	left: 4%;
	top: -2%;
`;

const DR = styled.button`
	/* Auto layout */
	display: flex;
	justify-content: center;
	align-items: center;
	width: 45px;
	height: 28px;

	border-radius: 100px;

	/* D. Btn Gradient */

	background: linear-gradient(180deg, #282727 0%, #191818 100%);
	border: 1px solid rgba(255, 255, 255, 0.1);
	/* Highlight-Glow-Shadow */

	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.08),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 8px;
	color: ${(props) => props.theme.colors.white};

	:hover {
		cursor: pointer;
	}

	:active {
		cursor: pointer;
		/* Primary Gold */
		border: 0.669444px solid #c9975b;
		box-shadow: 0px 1.33889px 1.33889px rgba(0, 0, 0, 0.25),
			inset 0px 0px 13.3889px rgba(255, 255, 255, 0.03);
		border-radius: 8px;
	}

	:focus {
		background: rgba(0, 0, 0, 0);
		border: 0.669444px solid #c9975b;
	}
`;

// Date range container
const DrContainer = styled.div`
	box-sizing: border-box;

	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 12px 5px;
`;

// Date ranges
const DRs = styled.div`
	display: flex;
	position: relative;
	width: 204px;
	height: 28px;

	left: 78%;
	top: 1.1%;

	color: ${(props) => props.theme.colors.white};
`;

const CardTitle = styled.div`
	display: flex;
	flex-direction: row;

	position: relative;
	width: 108px;
	height: 27px;
	left: 4%;
	top: 2.5%;

	font-family: ${(props) => props.theme.fonts.regular};
	font-weight: 400;
	font-size: 18px;
	line-height: 150%;

	color: ${(props) => props.theme.colors.white};
`;

const Card = styled(StyledCard)`
  * Rectangle 163 */

  box-sizing: border-box;
  width: 100%;
  height: 580px;
  margin-right: auto;
  margin-left: auto;
  top: 60px;

  background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
  
  /* Highlight-Glow */
  box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.08), inset 0px 0px 20px rgba(255, 255, 255, 0.03);
  border-radius: 15px;
`;

const Header = styled(BigWhiteHeader)`
	/* Kwenta Stats */

	position: relative;
	width: 141px;
	margin-top: 85px;

	/* Heading/H3 - GT America - 24 */
	font-style: normal;
	font-weight: 900;
	font-size: 24px;
`;

export default Stats;
