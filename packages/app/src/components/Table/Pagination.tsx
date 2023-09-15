import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import LeftEndArrowIcon from 'assets/svg/app/caret-left-end.svg'
import LeftArrowIcon from 'assets/svg/app/caret-left.svg'
import RightEndArrowIcon from 'assets/svg/app/caret-right-end.svg'
import RightArrowIcon from 'assets/svg/app/caret-right.svg'
import { FlexDivRow } from 'components/layout/flex'
import { GridDivCenteredCol } from 'components/layout/grid'
import { resetButtonCSS } from 'styles/common'

export type PaginationProps = {
	pageIndex: number
	pageCount: number
	canNextPage: boolean
	canPreviousPage: boolean
	compact: boolean
	setPage: (page: number) => void
	previousPage: () => void
	nextPage: () => void
	extra?: React.ReactNode
}

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
		extra,
	}) => {
		const { t } = useTranslation()

		const firstPage = () => setPage(0)
		const toLastPage = () => setPage(pageCount - 1)

		return (
			<>
				<PaginationContainer $compact={compact} $bottomBorder={!!extra}>
					<FlexDivRow columnGap="5px">
						<ArrowButton onClick={firstPage} disabled={!canPreviousPage}>
							<LeftEndArrowIcon />
						</ArrowButton>
						<ArrowButton onClick={previousPage} disabled={!canPreviousPage}>
							<LeftArrowIcon />
						</ArrowButton>
					</FlexDivRow>
					<PageInfo>
						{t('common.pagination.page')}{' '}
						{t('common.pagination.page-of-total-pages', {
							page: pageIndex + 1,
							totalPages: pageCount,
						})}
					</PageInfo>
					<FlexDivRow columnGap="5px">
						<ArrowButton onClick={nextPage} disabled={!canNextPage}>
							<RightArrowIcon />
						</ArrowButton>
						<ArrowButton onClick={toLastPage} disabled={!canNextPage}>
							<RightEndArrowIcon />
						</ArrowButton>
					</FlexDivRow>
				</PaginationContainer>
				{extra}
			</>
		)
	}
)

const PageInfo = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

const PaginationContainer = styled(GridDivCenteredCol)<{
	$compact: boolean
	$bottomBorder: boolean
}>`
	grid-template-columns: auto 1fr auto;
	padding: ${(props) => (props.$compact ? '10px' : '15px')} 12px;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
	justify-items: center;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	border-bottom: ${(props) =>
		props.$bottomBorder ? props.theme.colors.selectedTheme.border : 'none'};
	border-radius: 0px;
`

const ArrowButton = styled.button`
	${resetButtonCSS};
	padding: 4px;
	&[disabled] {
		cursor: default;
		opacity: 0.5;
	}
	svg {
		width: 9px;
		height: 9px;
		fill: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}

	width: 24px;
	height: 24px;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.background};
	border-radius: 100px;
`

export default Pagination
