import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';


type Props = {
	startTimeDate: Date | undefined;
};

const formatTimeUnit = (value: number) => {
	return value < 10 ? '0' + value : String(value);
};

export default function CountUpTimer({ startTimeDate }: Props) {
	const { t } = useTranslation();

	const nowTime = new Date().getTime();
	let startTime = startTimeDate?.getTime() ?? nowTime
	const showCountdown = true

	const calcTime = () => {
		if(startTimeDate === undefined) startTime = nowTime
		const nowSeconds = nowTime / 1000;
		const timeSince = nowSeconds - startTime / 1000;
		const hours = Math.floor(timeSince / 3600);
		const minutes = Math.floor((timeSince - hours * 3600) / 60);
		const seconds = Math.floor(timeSince - (hours * 3600 + minutes * 60));

		return {
			hours: formatTimeUnit(hours),
			minutes: formatTimeUnit(minutes),
			seconds: formatTimeUnit(seconds)
		};
	};

	const [time, setTime] = useState<{ hours: string; minutes: string; seconds: string }>(calcTime());

	useEffect(() => {
		const interval = setInterval(() => setTime(calcTime()), 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<Container>
			<CountdownTime>
				{`Time since last oracle update: ${time.minutes}:${time.seconds}`}
			</CountdownTime>
		</Container>
	);
}

const Container = styled.div`

`;

const CountdownTime = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
`;
