import { useState } from 'react';
import styled from 'styled-components';
import { toPng } from 'html-to-image';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';

import TwitterIcon from 'assets/svg/social/twitter.svg';

function createTweet(text: any) {
	const url = 'https://v2.beta.kwenta.io';
	const via = 'kwenta_io';
	const twitterURL = `https://twitter.com/intent/tweet?&text=${text}&url=${url}&=${via}`;

	window.open(twitterURL, 'twitter');
}

const ShareModalButtons = () => {
	const { t } = useTranslation();
	const [copied, setCopied] = useState<boolean>(false);
	const [fetchingImage, setFetchingImage] = useState<boolean>(false);

	const handleShare = () => {
		const text = t('futures.modals.share.tweet-text');
		createTweet(text);
	};

	const handleCopyImageToClipboard = async () => {
		let htmlElement = document.getElementById('pnl-graphic');

		if (htmlElement) {
			setFetchingImage(true);
			const dataUrl = await toPng(htmlElement, { cacheBust: true });
			const res = await fetch(dataUrl);
			const blob: any = await res.blob();

			// Copy blob of image to clipboard
			await navigator.clipboard.write([
				new ClipboardItem({
					[blob.type]: blob,
				}),
			]);

			setFetchingImage(false);
			setCopied(true);
		}
	};

	const getTextToDisplay = () => {
		let text = '';

		fetchingImage && !copied
			? (text = t('futures.modals.share.buttons.copying'))
			: copied && !fetchingImage
			? (text = t('futures.modals.share.buttons.copied'))
			: (text = t('futures.modals.share.buttons.copy'));

		return text;
	};

	return (
		<>
			<ButtonContainer>
				<Button
					variant="primary"
					isRounded={true}
					onClick={handleCopyImageToClipboard}
					size="sm"
					disabled={false}
				>
					{getTextToDisplay()}
				</Button>
				<Button variant="primary" isRounded={true} onClick={handleShare} size="sm" disabled={false}>
					<TwitterIcon style={{ margin: '0px 15px -4.5px 0px' }} />
					{t('futures.modals.share.buttons.tweet-my-pnl')}
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

export default ShareModalButtons;
