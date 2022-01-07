import React from 'react';
import styled from 'styled-components';

type DetailsInfoBoxProps = {
	details: Record<string, string>;
};

const DetailsInfoBox: React.FC<DetailsInfoBoxProps> = ({ details }) => (
	<DetailsInfoBoxContainer>
		{Object.entries(details).map(([key, value]) => (
			<div key={key}>
				<p className="key">{key}:</p>
				<p className="value">{value}</p>
			</div>
		))}
	</DetailsInfoBoxContainer>
);

const DetailsInfoBoxContainer = styled.div`
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 4px;
	padding: 14px;
	box-sizing: border-box;

	div {
		display: flex;
		justify-content: space-between;
		align-items: center;

		p {
			margin: 0;
		}

		.key {
			color: #787878;
			font-size: 12px;
		}

		.value {
			color: #ece8e3;
			font-family: ${(props) => props.theme.fonts.mono};
			font-size: 12px;
		}

		&:not(:last-of-type) {
			margin-bottom: 8px;
		}
	}
`;

export default DetailsInfoBox;
