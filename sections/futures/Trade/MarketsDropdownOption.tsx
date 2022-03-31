import CurrencyIcon from 'components/Currency/CurrencyIcon';
import styled, { css } from 'styled-components';
import { CurrencyLabel, SingleValueContainer } from './MarketsDropdownSingleValue';
import { FlexDivCentered } from 'styles/common';
import { components, OptionProps } from 'react-select';

const MarketsDropdownOption: React.FC<OptionProps<any>> = (props) => (
	<components.Option {...props}>
		<OptionDetailsContainer $isSelected={props.isSelected}>
			<CurrencyIcon
				currencyKey={(props.data.value[0] !== 's' ? 's' : '') + props.data.value}
				width="31px"
				height="31px"
			/>
			<CurrencyMeta $isSelected={props.isSelected}>
				<div>
					<CurrencyLabel>{props.data.label}</CurrencyLabel>
					<p className="name">{props.data.description}</p>
				</div>
			</CurrencyMeta>
			<div>
				<p className="price">{props.data.price}</p>
				<p className={props.data.negativeChange ? `change red` : 'change green'}>
					{props.data.change}
				</p>
			</div>
		</OptionDetailsContainer>
	</components.Option>
);

const CurrencyMeta = styled(FlexDivCentered)<{ $isSelected: boolean }>`
	flex: 1;
	margin-left: 12px;

	${(props) =>
		props.$isSelected &&
		css`
			${CurrencyLabel} {
				color: ${(props) => props.theme.colors.common.secondaryGold};
			}
		`}
`;

const OptionDetailsContainer = styled(SingleValueContainer)<{ $isSelected: boolean }>`
	padding: 6px;

	p {
		margin: 0;
	}

	.price {
		font-family: ${(props) => props.theme.fonts.mono};
		color: ${(props) => props.theme.colors.common.primaryWhite};
		font-size: 15px;
		${(props) =>
			props.$isSelected &&
			css`
				color: ${(props) => props.theme.colors.common.secondaryGold};
			`}
	}

	.change {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 11.5px;
		text-align: right;
	}

	&:not(:last-of-type) {
		margin-bottom: 4px;
	}

	&:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.green {
		color: ${(props) => props.theme.colors.common.primaryGreen};
	}

	.red {
		color: ${(props) => props.theme.colors.common.primaryRed};
	}
`;

export default MarketsDropdownOption;
