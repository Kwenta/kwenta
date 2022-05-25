import TabButton from 'components/Button/TabButton';
import React from 'react';

const TABS = [
	{
		title: 'Open Position',
		component: <div />,
	},
];

const LowerTab: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0);

	return (
		<div>
			<div>
				{TABS.map(({ title }, i) => (
					<TabButton key={title} title={title} onClick={() => setActiveTab(i)} />
				))}
			</div>
			<div>{TABS[activeTab].component}</div>
		</div>
	);
};

export default LowerTab;
