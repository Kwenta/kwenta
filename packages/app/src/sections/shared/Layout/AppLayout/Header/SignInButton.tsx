import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import MoonIcon from 'assets/svg/app/moon.svg'
import SunIcon from 'assets/svg/app/sun.svg'
import Button from 'components/Button'
import useClickOutside from 'hooks/useClickOutside'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setTheme } from 'state/preferences/reducer'
import { selectCurrentTheme } from 'state/preferences/selectors'
import media from 'styles/media'

import ConnectionDot from './ConnectionDot'

const SignInButton: React.FC = () => {
	const { t } = useTranslation()
	const { data: session } = useSession()
	const dispatch = useAppDispatch()
	const currentTheme = useAppSelector(selectCurrentTheme)

	const { ref } = useClickOutside(() => setOpen(false))

	const [open, setOpen] = useState(false)

	const toggleTheme = () => {
		dispatch(setTheme(currentTheme === 'light' ? 'dark' : 'light'))
	}

	const ThemeIcon = currentTheme === 'dark' ? SunIcon : MoonIcon

	const signInButton = (
		<Button
			size="small"
			variant="flat"
			noOutline
			onClick={() => signIn()}
			data-testid="sign-in"
			mono
		>
			<ConnectionDot />
			{t('homepage.nav.sign-in')}
		</Button>
	)

	const signOutButton = (
		<>
			<Button size="small" textTransform="lowercase" noOutline onClick={() => setOpen(true)} mono>
				<ConnectionDot />
				{session?.user?.email}
			</Button>
			{open && (
				<ProfileTabContainer ref={ref}>
					<div>
						<Button
							fullWidth
							variant="flat"
							size="small"
							onClick={() => signOut()}
							data-testid="sign-out"
						>
							{t('homepage.nav.sign-out')}
						</Button>
					</div>
				</ProfileTabContainer>
			)}
		</>
	)

	return (
		<Container>
			{session?.user ? signOutButton : signInButton}
			<MenuButton onClick={toggleTheme} noOutline>
				<ThemeIcon width={20} />
			</MenuButton>
		</Container>
	)
}

const Container = styled.div`
	display: grid;
	grid-gap: 15px;
	grid-auto-flow: column;
`

const MenuButton = styled(Button)`
	display: grid;
	place-items: center;
	height: 41px;
	width: 41px;
	padding: 0px;

	svg {
		path {
			fill: ${(props) => props.theme.colors.selectedTheme.icon.fill};
		}
	}

	:hover {
		svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.icon.hover};
			}
		}
	}
`

const ProfileTabContainer = styled.div`
	z-index: 100;
	position: absolute;
	right: 12;

	${media.lessThan('mdUp')`
		padding: 15px;
	`}

	${media.greaterThan('mdUp')`
		margin-top: 56px;
	`}
`

export default SignInButton
