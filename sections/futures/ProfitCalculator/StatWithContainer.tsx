import styled from 'styled-components';

type StatWithContainerProps = {
	label: string;
	stat: any;
	type: number;
};

function textColor(type: number) {
	if (type === 0) return '#7FD482';
	if (type === 1) return '#EF6868';
	if (type === 2) return '#ECE8E3';
}

function pnlText(type: number, stat: any) {
	return `${type === 2 ? stat + 'x' : '$' + stat}`;
}

export const StatWithContainer: React.FC<StatWithContainerProps> = ({ label, stat, type }) => {
	return (
		<>
			<StatContainer>
				<StatLabel>{label}</StatLabel>
				<Stat style={{ color: textColor(type) }}>{pnlText(type, stat)}</Stat>
			</StatContainer>
		</>
	);
};

const Stat = styled.div`
	font-size: 16px;
	line-height: 19px;
	margin: -7.5px 0px 0px 12px;
`;

const StatLabel = styled.p`
	font-size: 14px;
	line-height: 14px;
	color: #787878;
	margin-left: 12px;
`;

const StatContainer = styled.div`
	width: auto;
	height: 69px;

	border: 1px solid rgba(255, 255, 255, 0.1);
	box-sizing: border-box;
	border-radius: 6px;
`;

export default StatWithContainer;
