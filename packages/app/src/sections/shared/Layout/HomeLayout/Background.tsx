import { memo } from 'react'
import styled, { keyframes } from 'styled-components'

const Background = memo(() => {
	return (
		<Container>
			<div className="line" />
			<div className="line" />
			<div className="line" />
		</Container>
	)
})

const drop = keyframes`
	from {
		top: -50%;
	}
	to {
		top:100%;
	}
`

const Container = styled.div`
	background-color: transparent;
	width: 100vw;
	height: 100vh;
	position: fixed;
	top: 0px;
	left: 0px;
	z-index: -100;

	> .line {
		position: absolute;
		width: 1px;
		height: 100%;
		top: 0;
		left: 50%;
		background: linear-gradient(to bottom, rgba(255, 255, 255, 0.056) 0%, #ffb70014 100%);
		overflow: hidden;
		opacity: 0.8;

		&::after {
			content: '';
			display: block;
			position: absolute;
			opacity: 0.3;
			height: 25vh;
			width: 100%;
			top: -50%;
			left: 0;
			background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, #ffffff 100%);
			animation: ${drop} 10s 0s infinite;
			animation-fill-mode: forwards;
			animation-timing-function: cubic-bezier(0.4, 0.26, 0, 0.97);
		}

		&:nth-child(1) {
			margin-left: -25%;
			&::after {
				animation-delay: 3s;
			}
		}
		&:nth-child(3) {
			margin-left: 25%;
			&::after {
				animation-delay: 3.5s;
			}
		}
	}
`

export default Background
