import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { linkCSS } from 'styles/common';

import FullScreenModal from 'components/FullScreenModal';
import Button from 'components/Button';

import { MENU_LINKS } from '../constants';

type MobileSettingsModalProps = {
	onDismiss: () => void;
};

export const MobileSettingsModal: FC<MobileSettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();

	return (
		<StyledFullScreenModal isOpen={true}>
			{MENU_LINKS.map(({ i18nLabel, link }) => (
				<MenuButtonContainer key={link}>
					<Link href={link}>
						<a>
							<MenuButton isActive={asPath.includes(link)} onClick={onDismiss}>
								{t(i18nLabel)}
							</MenuButton>
						</a>
					</Link>
				</MenuButtonContainer>
			))}
		</StyledFullScreenModal>
	);
};

const StyledFullScreenModal = styled(FullScreenModal)`
	border-top: 1px solid ${(props) => props.theme.colors.navy};
	[data-reach-dialog-content] {
		margin: 0;
		width: 100%;
	}
	.content {
		padding: 24px 32px;
	}
`;

const MenuButtonContainer = styled.div`
	padding-bottom: 16px;
`;

const MenuButton = styled(Button).attrs({ variant: 'alt', size: 'xl' })`
	width: 100%;
	a {
		${linkCSS};
	}
`;

export default MobileSettingsModal;
