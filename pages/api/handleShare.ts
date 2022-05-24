// import fs from 'fs';
// import path from 'path';

export default function (req: any, res: any) {
	const dataUrl = req.body.dataUrl;

	// writeImage(dataUrl);
	// const imagePath = getImagePath();
	// const imageUrl = getImageUrl(imagePath);

	// res.setHeader('Content-Type', 'image/png');
	// res.send(imageUrl);

	res.setHeader('Content-Type', 'text');
	res.send(dataUrl);
}
