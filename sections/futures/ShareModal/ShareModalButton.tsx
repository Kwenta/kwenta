import { toPng } from 'html-to-image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';

function downloadPng(dataUrl: string) {
	const link = document.createElement('a');

	link.download = 'my-pnl-on-kwenta.png';
	link.href = dataUrl;
	link.pathname = 'assets/png/' + link.download;
	link.click();
}

const ShareModalButton = () => {
	const { t } = useTranslation();

	const handleDownloadImage = async () => {
		let node = document.getElementById('pnl-graphic');

		if (node) {
			const dataUrl = await toPng(node, { cacheBust: true });
			downloadPng(dataUrl);
		}
	};

	return (
		<>
			<ButtonContainer>
				<Button variant="primary" onClick={handleDownloadImage} size="small" disabled={false}>
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
