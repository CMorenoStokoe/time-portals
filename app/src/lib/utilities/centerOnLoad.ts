// Utility function to center an element's scroll position on load
export const centerOnLoad = (ele: HTMLElement) => {
	ele.scrollLeft = (ele.scrollWidth - ele.clientWidth) / 2;
	ele.scrollTop = (ele.scrollHeight - ele.clientHeight) / 2;
};
