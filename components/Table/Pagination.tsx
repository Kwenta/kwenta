import React, { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { GridDivCenteredCol, resetButtonCSS } from 'styles/common';

import LeftArrowIcon from 'assets/inline-svg/app/caret-left.svg';
import LeftEndArrowIcon from 'assets/inline-svg/app/caret-left-end.svg';
import RightArrowIcon from 'assets/inline-svg/app/caret-right.svg';
import RightEndArrowIcon from 'assets/inline-svg/app/caret-right-end.svg';

type PaginationProps = {
	pageIndex: number;
	pageCount: number;
	canNextPage: boolean;
	canPreviousPage: boolean;
	setPage: (page: number) => void;
	previousPage: () => void;
	nextPage: () => void;
};

const Pagination: FC<PaginationProps> = ({
	pageIndex,
	pageCount,
	canNextPage = true,
	canPreviousPage = true,
	setPage,
	nextPage,
	previousPage,
}) => {
	const { t } = useTranslation();

	return (
		<PaginationContainer>
			<span>
				<ArrowButton onClick={() => setPage(0)} disabled={!canPreviousPage}>
					<LeftEndArrowIcon />
				</ArrowButton>
				<ArrowButton onClick={() => previousPage()} disabled={!canPreviousPage}>
					<LeftArrowIcon />
				</ArrowButton>
			</span>
			<PageInfo>
				{t('common.pagination.page')}{' '}
				{t('common.pagination.page-of-total-pages', { page: pageIndex + 1, totalPages: pageCount })}
			</PageInfo>
			<span>
				<ArrowButton onClick={() => nextPage()} disabled={!canNextPage}>
					<RightArrowIcon />
				</ArrowButton>
				<ArrowButton onClick={() => setPage(pageCount - 1)} disabled={!canNextPage}>
					<RightEndArrowIcon />
				</ArrowButton>
			</span>
		</PaginationContainer>
	);
};

const PageInfo = styled.span`
	color: ${(props) => props.theme.colors.silver};
`;

const PaginationContainer = styled(GridDivCenteredCol)`
	grid-template-columns: auto 1fr auto;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 15px 12px;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
	justify-items: center;
`;

const ArrowButton = styled.button`
	${resetButtonCSS};
	padding: 4px;
	&[disabled] {
		cursor: default;
		opacity: 0.5;
	}
	svg {
		width: 14px;
		height: 14px;
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

export default Pagination;
