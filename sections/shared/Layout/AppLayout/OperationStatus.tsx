import styled from 'styled-components';

import { Body } from 'components/Text';
import common from 'styles/theme/colors/common';

enum OperationalStatus {
	FullyOperational = 'Fully operational',
	Degraded = 'Degraded',
	Offline = 'Offline',
}

const OperationStatusThemeMap = {
	[OperationalStatus.FullyOperational]: {
		outer: common.palette.alpha.green20,
		inner: common.palette.green.g500,
	},
	[OperationalStatus.Degraded]: {
		outer: common.palette.alpha.red10,
		inner: common.palette.yellow.y500,
	},
	[OperationalStatus.Offline]: {
		outer: common.palette.alpha.red15,
		inner: common.palette.red.r300,
	},
} as const;

const CURRENT_STATUS = OperationalStatus.FullyOperational;

const OperationStatus = () => {
	return (
		<OperationStatusContainer>
			<OuterCircle $status={CURRENT_STATUS}>
				<InnerCircle $status={CURRENT_STATUS} />
			</OuterCircle>
			<Body color="secondary">{CURRENT_STATUS}</Body>
		</OperationStatusContainer>
	);
};

const OperationStatusContainer = styled.div`
	display: flex;
`;

const OuterCircle = styled.div<{ $status: OperationalStatus }>`
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 5px;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: ${(props) => OperationStatusThemeMap[props.$status].outer};
`;

const InnerCircle = styled.div<{ $status: OperationalStatus }>`
	background-color: ${(props) => OperationStatusThemeMap[props.$status].inner};
	width: 7px;
	height: 7px;
	border-radius: 50%;
`;

export default OperationStatus;
