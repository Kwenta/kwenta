import { FC, memo } from 'react';
import styled from 'styled-components';

type PillProps = {
	size?: 'small' | 'regular';
};

const Pill: FC<PillProps> = memo(({ size = 'regular' }) => {
	return <BasePill $size={size} />;
});

const BasePill = styled.div<{ $size: 'small' | 'regular' }>``;

export default Pill;
