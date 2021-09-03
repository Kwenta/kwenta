import React, { FC } from 'react';
import styled from 'styled-components';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';

import BlockExplorer from 'containers/BlockExplorer';
import { ExternalLink, GridDivCenteredCol, IconButton } from 'styles/common';
import ROUTES from 'constants/routes';

import EditIcon from 'assets/svg/app/edit.svg';
import LinkIcon from 'assets/svg/app/link.svg';

import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';

type ActionsColType = {
	cellProps: CellProps<HistoricalShortPosition>;
};

const ActionsCol: FC<ActionsColType> = ({ cellProps }) => {
	const { blockExplorerInstance } = BlockExplorer.useContainer();

	const router = useRouter();

	return (
		<ActionsContainer>
			<IconButton
				onClick={() =>
					router.push(ROUTES.Shorting.ManageShortAddCollateral(`${cellProps.row.original.id}`))
				}
			>
				<StyledLinkIcon src={EditIcon} viewBox={`0 0 ${EditIcon.width} ${EditIcon.height}`} />
			</IconButton>
			{blockExplorerInstance != null && cellProps.row.original.txHash && (
				<ExternalLink href={blockExplorerInstance.txLink(cellProps.row.original.txHash)}>
					<StyledLinkIcon src={LinkIcon} viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`} />
				</ExternalLink>
			)}
		</ActionsContainer>
	);
};

const ActionsContainer = styled(GridDivCenteredCol)`
	grid-gap: 10px;
	margin-left: auto;

	button {
		&:hover {
			color: ${(props) => props.theme.colors.goldColors.color1};
		}
	}
`;

const StyledLinkIcon = styled(Svg)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

export default ActionsCol;
