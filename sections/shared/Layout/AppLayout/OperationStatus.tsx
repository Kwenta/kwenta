import styled from 'styled-components';

import { Body } from 'components/Text';

const OperationStatus = () => {
	return (
		<OperationStatusContainer>
			<OuterCircle>
				<InnerCircle />
			</OuterCircle>
			<Body color="secondary">Fully operational</Body>
		</OperationStatusContainer>
	);
};

// TODO: Maybe better to do this with SVGs?

const OperationStatusContainer = styled.div`
	display: flex;
`;

const OuterCircle = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 5px;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: ${(props) => props.theme.colors.common.palette.alpha.green20};
`;

const InnerCircle = styled.div`
	background-color: ${(props) => props.theme.colors.common.palette.green.g500};
	width: 7px;
	height: 7px;
	border-radius: 50%;
`;

export default OperationStatus;
