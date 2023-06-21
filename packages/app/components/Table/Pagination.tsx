import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import LeftEndArrowIcon from 'assets/svg/app/caret-left-end.svg';
import LeftArrowIcon from 'assets/svg/app/caret-left.svg';
import RightEndArrowIcon from 'assets/svg/app/caret-right-end.svg';
import RightArrowIcon from 'assets/svg/app/caret-right.svg';
import { GridDivCenteredCol } from 'components/layout/grid';
import { resetButtonCSS } from 'styles/common';

type PaginationProps = {
	pageIndex: number;
	pageCount: number;
	canNextPage: boolean;
	canPreviousPage: boolean;
	compact: boolean;
	setPage: (page: number) => void;
	previousPage: () => void;
	nextPage: () => void;
};

const Pagination: FC<PaginationProps> = React.memo(
	({
		pageIndex,
		pageCount,
		canNextPage = true,
		canPreviousPage = true,
		compact = false,
		setPage,
		nextPage,
		previousPage,
	}) => {
		const { t } = useTranslation();

		const firstPage = () => setPage(0);
		const toLastPage = () => setPage(pageCount - 1);

		return (
			<PaginationContainer compact={compact}>
				<span>
					<ArrowButton onClick={firstPage} disabled={!canPreviousPage}>
						<LeftEndArrowIcon />
					</ArrowButton>
					<ArrowButton onClick={previousPage} disabled={!canPreviousPage}>
						<LeftArrowIcon />
					</ArrowButton>
				</span>
				<PageInfo>
					{t('common.pagination.page')}{' '}
					{t('common.pagination.page-of-total-pages', {
						page: pageIndex + 1,
						totalPages: pageCount,
					})}
				</PageInfo>
				<span>
					<ArrowButton onClick={nextPage} disabled={!canNextPage}>
						<RightArrowIcon />
					</ArrowButton>
					<ArrowButton onClick={toLastPage} disabled={!canNextPage}>
						<RightEndArrowIcon />
					</ArrowButton>
				</span>
			</PaginationContainer>
		);
	}
);

const PageInfo = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const PaginationContainer = styled(GridDivCenteredCol)<{ compact: boolean }>`
	grid-template-columns: auto 1fr auto;
	padding: ${(props) => (props.compact ? '10px' : '15px')} 12px;
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
		fill: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`;

export default Pagination;
