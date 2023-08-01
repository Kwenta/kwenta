import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import LeftEndArrowIcon from 'assets/svg/app/caret-left-end.svg'
import LeftArrowIcon from 'assets/svg/app/caret-left.svg'
import RightEndArrowIcon from 'assets/svg/app/caret-right-end.svg'
import RightArrowIcon from 'assets/svg/app/caret-right.svg'
import { GridDivCenteredCol } from 'components/layout/grid'
import { resetButtonCSS } from 'styles/common'
import media from 'styles/media'

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
				<PaginationContainer compact={compact}>
					<ArrowButtonContainer>
						<ArrowButton onClick={firstPage} disabled={!canPreviousPage}>
							<LeftEndArrowIcon />
						</ArrowButton>
						<ArrowButton onClick={previousPage} disabled={!canPreviousPage}>
							<LeftArrowIcon />
						</ArrowButton>
					</ArrowButtonContainer>
					<PageInfo>
						{t('common.pagination.page')}{' '}
						{t('common.pagination.page-of-total-pages', {
							page: pageIndex + 1,
							totalPages: pageCount,
						})}
					</PageInfo>
					<ArrowButtonContainer>
						<ArrowButton onClick={nextPage} disabled={!canNextPage}>
							<RightArrowIcon />
						</ArrowButton>
						<ArrowButton onClick={toLastPage} disabled={!canNextPage}>
							<RightEndArrowIcon />
						</ArrowButton>
					</ArrowButtonContainer>
				</PaginationContainer>
				{extra}
			</>
		)
	}
)

const ArrowButtonContainer = styled.div`
	${media.lessThan('lg')`
		display: flex;
		felx-direction: row;
		column-gap: 5px;
	`}
`

const PageInfo = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

const PaginationContainer = styled(GridDivCenteredCol)<{ compact: boolean }>`
	grid-template-columns: auto 1fr auto;
	padding: ${(props) => (props.compact ? '10px' : '15px')} 12px;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
	justify-items: center;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};

	${media.lessThan('lg')`
		border: ${(props) => props.theme.colors.selectedTheme.border};
		border-radius: 0px;
	`}
`

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

	${media.lessThan('lg')`
		border: none;
		border-radius: 100px;
		padding: 4px;
		width: 24px;
		height: 24px;
		background: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.background};

		svg {
			width: 9px;
			height: 9px;
		}
	`}
`

export default Pagination
