const keyframes = {
	show: `@keyframes show {
    to {
      opacity: 1;
      transform: none;
    }
  }`,
}

const animations = {
	show: `
        opacity: 0;
        animation: show 300ms ease-out forwards;
        ${keyframes.show}
  `,
}

export default animations
