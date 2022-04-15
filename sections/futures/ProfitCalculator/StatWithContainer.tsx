import styled from 'styled-components';

export const StatWithContainer = (props: { label: string; stateVar: any; type: number }) => {
	return (
		<>
			<StatContainer>
				<StatLabel>{props.label}</StatLabel>
				{props.type === 0 ? <Stat style={{ color: '#7FD482' }}>{`$ ${props.stateVar}`}</Stat> : ''}
				{props.type === 1 ? <Stat style={{ color: '#EF6868' }}>{`$ ${props.stateVar}`}</Stat> : ''}
				{props.type === 2 ? <Stat style={{ color: '#ECE8E3' }}>{`${props.stateVar}x`}</Stat> : ''}
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
