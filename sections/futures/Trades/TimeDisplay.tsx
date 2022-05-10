import { FC, useState } from 'react';
import { format, Locale } from 'date-fns';

import getLocale from './getLocale';

type TimeDisplayProps = {
	cellProps: any;
};

const TimeDisplay: FC<TimeDisplayProps> = ({ cellProps }) => {
	const [show12hr, setShow12h] = useState<boolean>(false);

	const handleOnClick = () => {
		setShow12h(!show12hr);
	};

	let language: Locale = { code: '' };

	navigator.languages !== undefined
		? (language.code = navigator.languages[0])
		: (language.code = navigator.language);

	const date = format(new Date(cellProps.value), 'MM/dd/yy', {
		locale: getLocale(language.code),
	});
	const time12hr = new Date(cellProps.value).toLocaleTimeString(language.code);
	const time24hr = format(new Date(cellProps.value), 'HH:mm:ss', {
		locale: getLocale(language.code),
	});

	format(new Date(cellProps.value), 'MM/dd/yy');
	format(new Date(cellProps.value), 'HH:mm:ss aa');

	return (
		<>
			<div onClick={handleOnClick}>
				<div>{date}</div>
				<div style={{ maxWidth: '73px' }}>{show12hr ? time12hr : time24hr}</div>
			</div>
		</>
	);
};

export default TimeDisplay;
