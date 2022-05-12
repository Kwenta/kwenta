import { FC, useState } from 'react';
import { format, Locale } from 'date-fns';

import getLocale from './getLocale';

type TimeDisplayProps = {
	cellPropsValue: any;
};

const TimeDisplay: FC<TimeDisplayProps> = ({ cellPropsValue }) => {
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
		<>
			<div onClick={handleOnClick}>
				<div>{date}</div>
				<div>{show12hr ? time12hr : time24hr}</div>
			</div>
		</>
	);
};

export default TimeDisplay;
