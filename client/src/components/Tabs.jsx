import React from 'react';
import { useCallback, useState } from 'react';

const TabsContext = React.createContext({
	selectedTab: null,
	setSelectedTab: tab => {
		throw new Error('Requires TabsContext.Provider');
	}
});

export function Tabs({ children, defaultSelectedTab }) {
	const [selectedTab, setSelectedTab] = useState(defaultSelectedTab);
	const contextValue = React.useMemo(() => (
		{ setSelectedTab, selectedTab }),
		[selectedTab, setSelectedTab]
	);

	// Render the tabs outer container
	return (
		<TabsContext.Provider value={contextValue}>
			<div className="tabs">
				{children}
			</div>
		</TabsContext.Provider>
	)
};

export function TabList({ children, 'aria-label': ariaLabel }) {
	const refList = React.useRef(null);

	// Listen for keyboard changes
	const onKeyDown = useCallback(event => {
		const list = refList.current;
		if (!list) {
			return;
		}

		// Get currently active tab
		const tabs = Array.from(
			list.querySelectorAll('[role="tab"]:not([diabled])')
		);
		const index = tabs.indexOf(document.activeElement);
		if (index < 0) {
			return;
		}

		// Change selected tab on arrow key presses
		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowLeft': {
				const next = (index - 1 + tabs.length) % tabs.length;
				tabs[next]?.focus();
				break;
			}
			case 'ArrowDown':
			case 'ArrowRight': {
				const next = (index + 1 + tabs.length) % tabs.length;
				tabs[next]?.focus();
				break;
			}
		};
	}, []);

	// Render tab container
	return (
		<ul
			ref={refList}
			role='tablist'
			aria-label={ariaLabel}
			onKeyDown={onKeyDown}
			className='tablist'
		>
			{children}
		</ul>
	);
};

export function Tab({ children, tab }) {
	const { selectedTab, setSelectedTab } = React.useContext(TabsContext);

	// Render tab
	return (
		<li
			role="tab"
			aria-selected={selectedTab === tab}
			aria-controls={`tabpanel-${tab}`}
			onClick={() => setSelectedTab(tab)}
			tabIndex={selectedTab === tab ? 0 : -1}
			className={'tab' + (selectedTab === tab ? ' selected' : '')}
		>
			{children}
		</li>
	);
};

export function TabPanel({ children, tab }) {
	const { selectedTab } = React.useContext(TabsContext);

	// Ensure selected tab exists
	if (selectedTab !== tab) {
		return null;
	}

	// Render panels controlled by the tabs
	return (
		<div id={`tabpanel-${tab}`} className="tabpanel" role="tabpanel" tabIndex={0}>
			{children}
		</div>
	);
};