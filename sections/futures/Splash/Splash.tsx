import { FC } from 'react';
import { Svg } from 'react-optimized-image';

import background from 'assets/svg/futures/background.svg';
import body from 'assets/svg/futures/body.svg';
import logo from 'assets/svg/futures/logo.svg';

import { Background, Body, Logo, Root } from './styles';

const Splash: FC = () => {
	return (
		<Root>
			<Background>
				<Svg src={background} />
			</Background>
			<Logo>
				<Svg src={logo} />
			</Logo>
			<Body>
				<Svg src={body} />
			</Body>
      <main>
        <p>
          Welcome to
        </p>
        <p>
          Decentralized
        </p>
        <p>
          Futures on Layer 2
        </p>
        <p>
          Sign up for a chance to be a part of the Kwenta Elite!
        </p>
        <p>
          An L2 testnet trading competition powered by the OVM. Experience the speed
          of optimistic rollups and compete to <strong>win 50k SNX</strong>
        </p>
      </main>
		</Root>
	);
};

export default Splash;
