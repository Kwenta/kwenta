import React from 'react';
import styled from 'styled-components';

import { fonts } from 'styles/theme/fonts';
import { FlexDivCentered } from 'styles/common';
import LeftArrowIcon from 'assets/inline-svg/app/caret-left.svg';
import RightArrowIcon from 'assets/inline-svg/app/caret-right.svg';

type PaginationProps = {
	pageIndex: number;
	pageCount: number;
	canNextPage: boolean;
	canPreviousPage: boolean;
	setPage: (page: number) => void;
};

const Pagination = ({
	pageIndex,
	pageCount,
	canNextPage = true,
	canPreviousPage = true,
	setPage,
}: PaginationProps) => {
	let pageLinks: React.ReactNode[] = [];
	for (let i = 0; i < pageCount; i++) {
		pageLinks.push(
			<PageLink onClick={() => setPage(i)} key={`${i}-pagelink`} active={pageIndex === i}>
				{i + 1}
			</PageLink>
		);
	}

	if (pageCount > 6) {
		pageLinks = [
			...pageLinks.slice(0, 3),
			<PageLink>...</PageLink>,
			...pageLinks.slice(pageLinks.length - 3, pageLinks.length),
		];
	}

	return (
		<PaginationContainer>
			{pageCount > 1 ? (
				<span>
					{canPreviousPage && <StyledLeftArrowIcon onClick={() => setPage(pageIndex - 1)} />}
					{pageLinks}
					{canNextPage && <StyledRightArrowIcon onClick={() => setPage(pageIndex + 1)} />}
				</span>
			) : undefined}
		</PaginationContainer>
	);
};

const PageLink = styled.span<{ active?: boolean }>`
	${fonts.body.boldSmall};
	margin: 0px 7px;
	cursor: pointer;
	color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.silver)};
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
	background-color: ${(props) => props.theme.colors.elderberry};
	justify-content: center;
	padding: 23px 0px;
`;

export default Pagination;
