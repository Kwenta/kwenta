import React, { memo } from 'react';
import styled from 'styled-components';

import { NO_VALUE } from 'constants/placeholder';

export type DetailedInfo = {
	value: string | React.ReactNode;
	keyNode?: React.ReactNode;
	valueNode?: React.ReactNode;
	color?: 'green' | 'red' | 'gold' | undefined;
	spaceBeneath?: boolean;
};

type InfoBoxProps = {
	details: Record<string, DetailedInfo | null | undefined>;
	style?: React.CSSProperties;
	className?: string;
	disabled?: boolean;
	dataTestId?: string;
};

const InfoBox: React.FC<InfoBoxProps> = memo(
	({ details, style, className, disabled, dataTestId }) => (
		<InfoBoxContainer style={style} className={className}>
			{Object.entries(details).map(([key, value], index) => {
				if (value) {
					return (
						<React.Fragment key={key}>
							<div>
								<div className="key">
									{key}: {value.keyNode}
								</div>
								<p
									data-testid={`${dataTestId}-${index}`}
									className={`${disabled ? 'value closed' : 'value'}${
										value.color ? ` ${value.color}` : ''
									}`}
								>
									{disabled ? NO_VALUE : value.value}
									{value.valueNode}
								</p>
							</div>
							{value?.spaceBeneath && <br />}
						</React.Fragment>
					);
				}
				return null;
			})}
		</InfoBoxContainer>
	)
);

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
			color: ${(props) => props.theme.colors.selectedTheme.text.title};
			font-size: 13px;
			text-transform: capitalize;
			cursor: default;
		}

		.value {
			color: ${(props) => props.theme.colors.selectedTheme.text.value};
			font-family: ${(props) => props.theme.fonts.mono};
			font-size: 13px;
			cursor: default;
		}

		.red {
			color: ${(props) => props.theme.colors.selectedTheme.red};
		}

		.green {
			color: ${(props) => props.theme.colors.selectedTheme.green};
		}

		.gold {
			color: ${(props) => props.theme.colors.common.primaryGold};
		}

		.closed {
			color: ${(props) => props.theme.colors.selectedTheme.gray};
		}

		&:not(:last-of-type) {
			margin-bottom: 8px;
		}
	}
`;

export default InfoBox;
