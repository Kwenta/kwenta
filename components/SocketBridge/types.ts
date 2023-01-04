export type RGB = {
	r: number;
	g: number;
	b: number;
};

export type SocketCustomizationProps = {
	width?: number; // Width of the widget in px
	responsiveWidth?: boolean; // Widget is responsive relative to the parent element
	borderRadius?: number; // Radius of all borders in widget, takes values between 0 - 1
	accent?: string; // Background color of buttons
	onAccent?: string; // Color of text in buttons
	primary?: string; // Background color of widget and modals
	secondary?: string; // Foreground color of info section, hover hightlights, cards
	text?: string; // Color of all text, headings and emphasised font on widget
	secondaryText?: string; // Color of labels, icons, footer text on widget
	interactive?: string; // Background color of dropdown elements
	onInteractive?: string; // Color of text in dropdowns
	outline?: string; // Outline color of lines, borders and icons
	fontFamily?: string; // Font of the widget
};
