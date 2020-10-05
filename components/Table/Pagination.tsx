import React, { FC } from 'react';
import styled, { css } from 'styled-components';

import { FlexDivCentered, TextButton } from 'styles/common';

import LeftArrowIcon from 'assets/inline-svg/app/caret-left.svg';
import RightArrowIcon from 'assets/inline-svg/app/caret-right.svg';

const ELLIPSIS_CUTOFF_PAGE_COUNT = 6;

type PaginationProps = {
	pageIndex: number;
	pageCount: number;
	canNextPage: boolean;
	canPreviousPage: boolean;
	setPage: (page: number) => void;
};

const Pagination: FC<PaginationProps> = ({
	pageIndex,
	pageCount,
	canNextPage = true,
	canPreviousPage = true,
	setPage,
}) => {
	let pageLinks: React.ReactNode[] = [];
	for (let i = 0; i < pageCount; i++) {
		pageLinks.push(
			<PageLink onClick={() => setPage(i)} key={`${i}-pagelink`} active={pageIndex === i}>
				{i + 1}
			</PageLink>
		);
	}

	if (pageCount > ELLIPSIS_CUTOFF_PAGE_COUNT) {
		pageLinks = [
			...pageLinks.slice(0, 3),
			<Ellipsis>...</Ellipsis>,
			...pageLinks.slice(pageLinks.length - 3, pageLinks.length),
		];
	}

	return (
		<PaginationContainer>
			{pageCount > 1 ? (
				<>
					<StyledLeftArrowIcon onClick={() => setPage(pageIndex - 1)} disabled={canNextPage} />
					{pageLinks}
					<StyledRightArrowIcon onClick={() => setPage(pageIndex + 1)} disabled={canPreviousPage} />
				</>
			) : undefined}
		</PaginationContainer>
	);
};

const pageLinkCSS = css`
	font-family: ${(props) => props.theme.fonts.bold};
	margin: 0px 7px;
`;

const Ellipsis = styled.span`
	${pageLinkCSS};
`;

const PageLink = styled(TextButton)<{ active?: boolean }>`
	${pageLinkCSS};
	color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.silver)};
`;

const arrowIconCSS = css`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.goldColors.color1};
	cursor: pointer;
	&[disabled] {
		cursor: default;
		opacity: 0.5;
	}
`;

// @ts-ignore
const StyledLeftArrowIcon = styled(LeftArrowIcon)`
	${arrowIconCSS};
	margin-right: 10px;
`;

// @ts-ignore
const StyledRightArrowIcon = styled(RightArrowIcon)`
	${arrowIconCSS};
	margin-left: 10px;
`;

const PaginationContainer = styled(FlexDivCentered)`
	background-color: ${(props) => props.theme.colors.elderberry};
	justify-content: center;
	padding: 23px 0px;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
`;

export default Pagination;
