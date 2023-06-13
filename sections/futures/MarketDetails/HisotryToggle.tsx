import { useCallback } from 'react';
import styled, { css } from 'styled-components';

import { FlexDiv, FlexDivCol } from 'components/layout/flex';
import { Body } from 'components/Text';
import { setShowTradeHistory } from 'state/futures/reducer';
import { selectShowHistory } from 'state/futures/selectors';
import { useAppSelector, useAppDispatch } from 'state/hooks';

const HistoryToggle = () => {
	const dispatch = useAppDispatch();
	const showHistory = useAppSelector(selectShowHistory);

	const handleHistoryChange = useCallback(() => dispatch(setShowTradeHistory(!showHistory)), [
		dispatch,
		showHistory,
	]);

	return (
		<>
			<FlexDivCol>
				<Body color="secondary">Hisotry</Body>
				<FlexDiv columnGap="10px">
					{['show', 'hide'].map((value) => (
						<ToggleButton
							color="secondary"
							$active={value === 'show' ? showHistory : !showHistory}
							onClick={handleHistoryChange}
						>
							{value}
						</ToggleButton>
					))}
				</FlexDiv>
			</FlexDivCol>
		</>
	);
};

const ToggleButton = styled(Body)<{ $active: boolean }>`
	cursor: pointer;
	text-transform: capitalize;

	${(props) =>
		props.$active &&
		css`
			color: ${props.theme.colors.selectedTheme.newTheme.text.primary};
			font-weight: 700;
		`}
`;

export default HistoryToggle;
