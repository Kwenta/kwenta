import { toJpeg } from 'html-to-image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';

function downloadPng(dataUrl: string): void {
	const link = document.createElement('a');

	link.download = 'my-pnl-on-kwenta.jpeg';
	link.href = dataUrl;
	link.pathname = 'assets/png/' + link.download;
	link.click();
}

async function createImg(): Promise<string> {
	const element = document.getElementById('pnl-graphic') as HTMLDivElement;
	const imageSettings = { quality: 1 };

	const url = await toJpeg(element, imageSettings);

	let img = document.createElement('img');
	img.src = url;

	const image = await new Promise((resolve) => {
		img.onload = () => {
			toJpeg(element, imageSettings).then((dataUrl: string) => {
				resolve(dataUrl);
			});
		};
	});

	return image as string;
}

const ShareModalButton = () => {
	const { t } = useTranslation();

	const handleDownloadImage = async () => {
		const result = await createImg();
		downloadPng(result);
	};

	return (
		<>
			<ButtonContainer>
				<Button variant="primary" onClick={handleDownloadImage} size="sm" disabled={false}>
					{t('futures.modals.share.buttons.download')}
				</Button>
			</ButtonContainer>
		</>
	);
};

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	gap: 4vw;

	margin: 25px 0px 25px 0px;

	justify-content: center;
`;

export default ShareModalButton;
