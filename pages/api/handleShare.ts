import fs from 'fs';
import path from 'path';

export default function (req: any, res: any) {
	const dataUrl = req.body.dataUrl;

	// ba64.writeImage('myimage', dataUrl, (err: any) => {
	// 	if (err) {
	// 		console.log('Write image error', err);
	// 	}
	// 	console.log('Image saved successfully');
	// });

	res.setHeader('Content-Type', 'image/png');
	res.send('success');
}
