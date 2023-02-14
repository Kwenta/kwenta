import { FC, memo } from 'react';
import styled from 'styled-components';

type PillProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	size?: 'small' | 'large';
};

const Pill: FC<PillProps> = memo(({ size = 'small', ...props }) => {
	return <BasePill $size={size} {...props} />;
});

const BasePill = styled.button<{ $size: 'small' | 'large' }>``;

export default Pill;
