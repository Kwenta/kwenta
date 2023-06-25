import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import LeftEndArrowIcon from 'assets/svg/app/caret-left-end.svg'
import LeftArrowIcon from 'assets/svg/app/caret-left.svg'
import RightEndArrowIcon from 'assets/svg/app/caret-right-end.svg'
import RightArrowIcon from 'assets/svg/app/caret-right.svg'
import { FlexDivRowCentered } from 'components/layout/flex'
import { GridDivCenteredCol } from 'components/layout/grid'

type PaginationProps = {
	pageIndex: number
	pageCount: number
	canNextPage: boolean
	canPreviousPage: boolean
	compact: boolean
	setPage: (page: number) => void
	previousPage: () => void
	nextPage: () => void
}

const CustomizePagination: FC<PaginationProps> = React.memo(
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
		const { t } = useTranslation()

		const firstPage = () => setPage(0)
		const toLastPage = () => setPage(pageCount - 1)

		return (
			<PaginationContainer compact={compact}>
				<FlexDivRowCentered columnGap="15px">
					<FlexDivRowCentered columnGap="5px">
						<ArrowButton onClick={firstPage} disabled={!canPreviousPage}>
							<LeftEndArrowIcon />
						</ArrowButton>
						<ArrowButton onClick={previousPage} disabled={!canPreviousPage}>
							<LeftArrowIcon />
						</ArrowButton>
					</FlexDivRowCentered>
					<FlexDivRowCentered columnGap="5px">
						<ArrowButton onClick={nextPage} disabled={!canNextPage}>
							<RightArrowIcon />
						</ArrowButton>
						<ArrowButton onClick={toLastPage} disabled={!canNextPage}>
							<RightEndArrowIcon />
						</ArrowButton>
					</FlexDivRowCentered>
				</FlexDivRowCentered>
				<PageInfo>
					{t('common.pagination.page')}{' '}
					{t('common.pagination.page-of-total-pages', {
						page: pageIndex + 1,
						totalPages: pageCount,
					})}
				</PageInfo>
			</PaginationContainer>
		)
	}
)

const PageInfo = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin-left: 10px;
	font-size: 13px;
`

const PaginationContainer = styled(GridDivCenteredCol)<{ compact: boolean }>`
	grid-template-columns: auto 1fr auto;
	padding: ${(props) => (props.compact ? '10px' : '15px')} 12px;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
`

const ArrowButton = styled.button`
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.background};
	border: none;
	border-radius: 100px;
	padding: 4px;
	width: 24px;
	height: 24px;

	&[disabled] {
		cursor: default;
		opacity: 0.5;
	}
	svg {
		height: 9px;
		width: 9px;
		fill: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`

export default CustomizePagination
