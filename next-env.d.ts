/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next-images" />

declare global {
	interface Window {
		ethereum: Provider | undefined;
	}
}

export {};
