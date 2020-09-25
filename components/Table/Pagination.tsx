import styled from 'styled-components';

import { fonts } from 'styles/theme/fonts';
import { FlexDivCentered } from 'styles/common';
import LeftArrowIcon from 'assets/inline-svg/app/caret-left.svg';
import RightArrowIcon from 'assets/inline-svg/app/caret-right.svg';

type PaginationProps = {
	pageIndex: number;
	pageSize: number;
	pageCount: number;
	canNextPage: boolean;
	canPreviousPage: boolean;
	setPage: (page: number) => void;
};

const Pagination = ({
	pageIndex,
	pageSize = 6,
	pageCount,
	canNextPage = true,
	canPreviousPage = true,
	setPage,
}: PaginationProps) => {
	const pageLinks: React.ReactNode[] = [];
	for (let i = 1; i <= pageSize; i++) {
		pageLinks.push(<PageLink onClick={() => setPage(i)}>{i}</PageLink>);
	}

	return (
		<PaginationContainer>
			<span>
				{canPreviousPage && <StyledLeftArrowIcon />}
				{pageLinks}
				{canNextPage && <StyledRightArrowIcon />}
			</span>
		</PaginationContainer>
	);
};

const PageLink = styled.span`
	margin: 0px 15px;
	cursor: pointer;
`;

// @ts-ignore
const StyledLeftArrowIcon = styled(LeftArrowIcon)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.purple};
	cursor: pointer;
`;

// @ts-ignore
const StyledRightArrowIcon = styled(RightArrowIcon)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.purple};
	cursor: pointer;
`;

const PaginationContainer = styled(FlexDivCentered)`
	${fonts.body.boldSmall};
	background-color: ${(props) => props.theme.colors.elderberry};
	justify-content: center;
	padding: 23px 0px;
	color: ${(props) => props.theme.colors.silver};
`;

export default Pagination;
