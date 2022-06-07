import { FC, useState } from 'react';
import styled, { css } from 'styled-components';
import { format, Locale } from 'date-fns';

import getLocale from '../../../utils/formatters/getLocale';

type TimeDisplayProps = {
	cellPropsValue: any;
	horizontal?: boolean;
};

const TimeDisplay: FC<TimeDisplayProps> = ({ cellPropsValue, horizontal }) => {
	const [show12hr, setShow12h] = useState<boolean>(false);

	const handleOnClick = () => {
		setShow12h(!show12hr);
	};

	let language: Locale = { code: '' };

	navigator.languages !== undefined
		? (language.code = navigator.languages[0])
		: (language.code = navigator.language);

	const date = format(new Date(cellPropsValue), 'MM/dd/yy', {
		locale: getLocale(language.code),
	});
	const time12hr = new Date(cellPropsValue).toLocaleTimeString(language.code);
	const time24hr = format(new Date(cellPropsValue), 'HH:mm:ss', {
		locale: getLocale(language.code),
	});

	return (
		<TimeDisplayContainer horizontal={horizontal} onClick={handleOnClick}>
			<div>{date}</div>
			<div>{show12hr ? time12hr : time24hr}</div>
		</TimeDisplayContainer>
	);
};

const TimeDisplayContainer = styled.div<{ horizontal?: boolean }>`
	${(props) =>
		props.horizontal &&
		css`
			display: flex;
			div:first-child {
				margin-right: 5px;
			}
			div:last-child {
				color: ${(props) => props.theme.colors.common.secondaryGray};
			}
		`}
`;

export default TimeDisplay;
