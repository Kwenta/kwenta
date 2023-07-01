import React from 'react'
// import { DefaultTheme, IStyledComponent } from 'styled-components'

type WebpProps = {
	/** (only) png files imported. */
	srcOrSrcset: any
	/** styled <img> element. */
	StyledImg?: any
}

const Webp: React.FC<WebpProps> = ({ srcOrSrcset, StyledImg }) => {
	return (
		<picture>
			<source srcSet={`${srcOrSrcset}?webp`} type="image/webp" />
			<source srcSet={srcOrSrcset} type="image/png" />
			{StyledImg ? <StyledImg src={srcOrSrcset} /> : <img src={srcOrSrcset} />}
		</picture>
	)
}

export default Webp
