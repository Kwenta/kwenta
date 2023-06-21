import Widgetbot from '@widgetbot/react-embed'
import { useState } from 'react'

import { Body } from 'components/Text'

export default function ChatRoom() {
	const [showChat, setShowChat] = useState(false)
	return (
		<>
			<a
				href="#"
				onClick={(e) => {
					e.preventDefault()
					setShowChat(!showChat)
				}}
			>
				<Body color="secondary" style={{ marginRight: '18px' }}>
					Chat
				</Body>
			</a>

			{showChat && (
				<Widgetbot
					server="852273007370960937"
					channel="852528616533000213"
					shard="https://emerald.widgetbot.io"
					width={500}
					height={400}
					style={{
						position: 'absolute',
						bottom: 0,
						right: 0,
						marginBottom: '50px',
						marginRight: '50px',
					}}
				/>
			)}
		</>
	)
}
