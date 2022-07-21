import styled from 'styled-components';

import { formatPercent } from 'utils/formatters/number';

type OpenInterestProps = {
	skew: {
		long: number;
		short: number;
	};
};

const OpenInterestChart: React.FC<OpenInterestProps> = ({ skew }) => {
	return (
		<OIContainer>
			{skew.long !== 0 || skew.short !== 0 ? (
				<LongOI>
					<ShortOI skew={skew}></ShortOI>
				</LongOI>
			) : (
				<ZeroOI></ZeroOI>
			)}
		</OIContainer>
	);
};

export default OpenInterestChart;

const OIContainer = styled.div`
	border: 1px solid #2b2a2a;
	border-radius: 1px;
	width: 100%;
`;

const ShortOI = styled.div<{ skew: { long: number; short: number } }>`
	background-color: ${(props) => props.theme.colors.selectedTheme.red};
	height: 9px;
	width: ${(props) => formatPercent(props.skew.short, { minDecimals: 0 })};
`;

const LongOI = styled.div`
	background-color: ${(props) => props.theme.colors.selectedTheme.green};
	width: 100%;
	height: 9px;
`;

const ZeroOI = styled.div`
	background-color: ${(props) => props.theme.colors.selectedTheme.gray};
	width: 100%;
	height: 9px;
`;
