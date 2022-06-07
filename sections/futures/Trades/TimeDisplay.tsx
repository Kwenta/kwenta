import { FC, useState } from 'react';
import { format } from 'date-fns';

import getLocale from 'utils/formatters/getLocale';

type TimeDisplayProps = {
	cellPropsValue: any;
};

const TimeDisplay: FC<TimeDisplayProps> = ({ cellPropsValue }) => {
	const [show12hr, setShow12h] = useState<boolean>(false);

	const handleOnClick = () => {
		setShow12h(!show12hr);
	};

	const date = format(new Date(cellPropsValue), 'MM/dd/yy', {
		locale: getLocale(),
	});
	const time12hr = new Date(cellPropsValue).toLocaleTimeString(getLocale().code);
	const time24hr = format(new Date(cellPropsValue), 'HH:mm:ss', {
		locale: getLocale(),
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
