import { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { Body } from 'components/Text';
import Tooltip from 'components/Tooltip/Tooltip';
import { OperationalStatus } from 'constants/status';
import { fetchKwentaStatus } from 'state/app/actions';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import common from 'styles/theme/colors/common';

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

const OperationStatus = () => {
	const kwentaStatus = useAppSelector(({ app }) => app.kwentaStatus);
	const dispatch = useAppDispatch();

	const fetchStatus = useCallback(() => {
		dispatch(fetchKwentaStatus());
	}, [dispatch]);

	useEffect(() => {
		fetchStatus();
	}, [fetchStatus]);

	const content = useMemo(
		() => (
			<OperationStatusContainer>
				<OuterCircle $status={kwentaStatus.status}>
					<InnerCircle $status={kwentaStatus.status} />
				</OuterCircle>
				<Body color="secondary">{kwentaStatus.status}</Body>
			</OperationStatusContainer>
		),
		[kwentaStatus.status]
	);

	return !!kwentaStatus.message ? (
		<StyledTooltip height="auto" width="auto" preset="top" content={kwentaStatus.message}>
			{content}
		</StyledTooltip>
	) : (
		content
	);
};

const StyledTooltip = styled(Tooltip)`
	/*left: 75px;*/
`;

const OperationStatusContainer = styled.div`
	display: flex;
	cursor: default;
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
