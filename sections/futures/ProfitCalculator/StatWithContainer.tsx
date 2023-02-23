import styled from 'styled-components';

import { Body } from 'components/Text';

type StatWithContainerProps = {
	label: string;
	stat: any;
	type: number;
};
function textColor(props: any) {
	if (props.colorNum === 0) return props.theme.colors.selectedTheme.green;
	if (props.colorNum === 1) return props.theme.colors.selectedTheme.red;
	if (props.colorNum === 2) return props.theme.colors.selectedTheme.button.text.primary;
}
function pnlText(type: number, stat: any) {
	return `${type === 2 ? stat + 'x' : '$' + stat}`;
}

export const StatWithContainer: React.FC<StatWithContainerProps> = ({ label, stat, type }) => {
	return (
		<StatContainer>
			<StatLabel>{label}</StatLabel>
			<Stat colorNum={type}>{pnlText(type, stat)}</Stat>
		</StatContainer>
	);
};

const Stat = styled(Body).attrs({ size: 'large' })<{ colorNum: any }>`
	color: ${(props) => textColor(props)};
`;

const StatLabel = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	margin-top: 4px;
`;

const StatContainer = styled.div`
	width: auto;
	padding: 15px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	box-sizing: border-box;
	border-radius: 6px;
`;

export default StatWithContainer;
