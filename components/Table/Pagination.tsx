import React, { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { GridDivCenteredCol, resetButtonCSS } from 'styles/common';

import LeftArrowIcon from 'assets/svg/app/caret-left.svg';
import LeftEndArrowIcon from 'assets/svg/app/caret-left-end.svg';
import RightArrowIcon from 'assets/svg/app/caret-right.svg';
import RightEndArrowIcon from 'assets/svg/app/caret-right-end.svg';

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
					<Svg
						src={LeftEndArrowIcon}
						viewBox={`0 0 ${LeftEndArrowIcon.width} ${LeftEndArrowIcon.height}`}
					/>
				</ArrowButton>
				<ArrowButton onClick={() => previousPage()} disabled={!canPreviousPage}>
					<img src={LeftArrowIcon} viewBox={`0 0 ${LeftArrowIcon.width} ${LeftArrowIcon.height}`} />
				</ArrowButton>
			</span>
			<PageInfo>
				{t('common.pagination.page')}{' '}
				{t('common.pagination.page-of-total-pages', { page: pageIndex + 1, totalPages: pageCount })}
			</PageInfo>
			<span>
				<ArrowButton onClick={() => nextPage()} disabled={!canNextPage}>
					<Svg
						src={RightArrowIcon}
						viewBox={`0 0 ${RightArrowIcon.width} ${RightArrowIcon.height}`}
					/>
				</ArrowButton>
				<ArrowButton onClick={() => setPage(pageCount - 1)} disabled={!canNextPage}>
					<Svg
						src={RightEndArrowIcon}
						viewBox={`0 0 ${RightEndArrowIcon.width} ${RightEndArrowIcon.height}`}
					/>
				</ArrowButton>
			</span>
		</PaginationContainer>
	);
};

const PageInfo = styled.span`
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const PaginationContainer = styled(GridDivCenteredCol)`
	grid-template-columns: auto 1fr auto;
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
		fill: ${(props) => props.theme.colors.common.primaryWhite};
	}
`;

export default Pagination;
