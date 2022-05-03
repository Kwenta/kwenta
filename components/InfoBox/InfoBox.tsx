import { NO_VALUE } from 'constants/placeholder';
import React from 'react';
import styled from 'styled-components';

type DetailedInfo = {
	value: string;
	tooltip?: string;
	color?: 'green' | 'red' | 'gold';
	spaceBeneath?: boolean;
};

type InfoBoxProps = {
	details: Record<string, DetailedInfo>;
	style?: React.CSSProperties;
	className?: string;
	disabled?: boolean;
};

const InfoBox: React.FC<InfoBoxProps> = ({ details, style, className, disabled }) => {
	return (
		<InfoBoxContainer style={style} className={className}>
			{Object.entries(details).map(([key, value]) => (
				<React.Fragment key={key}>
					<div>
						<p className="key">{key}:</p>
						<p
							className={`${disabled ? 'value closed' : 'value'}${
								value.color ? ` ${value.color}` : ''
							}`}
						>
							{disabled ? NO_VALUE : value.value}
						</p>
					</div>
					{value?.spaceBeneath && <br />}
				</React.Fragment>
			))}
		</InfoBoxContainer>
	);
};

const InfoBoxContainer = styled.div`
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 14px;
	box-sizing: border-box;
	width: 100%;

	div {
		display: flex;
		justify-content: space-between;
		align-items: center;

		p {
			margin: 0;
		}

		.key {
			color: ${(props) => props.theme.colors.selectedTheme.input.placeholder};
			font-size: 12px;
			text-transform: capitalize;
		}

		.value {
			color: ${(props) => props.theme.colors.common.primaryWhite};
			font-family: ${(props) => props.theme.fonts.mono};
			font-size: 12px;
		}

		.red {
			color: ${(props) => props.theme.colors.common.primaryRed};
		}

		.green {
			color: ${(props) => props.theme.colors.common.primaryGreen};
		}

		.gold {
			color: ${(props) => props.theme.colors.common.primaryGold};
		}

		.closed {
			color: ${(props) => props.theme.colors.common.secondaryGray};
		}

		&:not(:last-of-type) {
			margin-bottom: 8px;
		}
	}
`;

export default InfoBox;
