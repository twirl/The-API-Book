const activeElements = [
    '.side-panel .close',
    'nav.page-main',
    '.side-panel .copy-button',
    '.side-panel .copy-link input',
    '.side-toc',
    '.side-panel',
    '.fade',
    'html'
].map((selector) => document.querySelector(selector));
const [$close, $unfold, $copy, $input, $sideToc, $sidePanel, $fade, $html] =
    activeElements;
document.addEventListener(
    'click',
    (e) => {
        let node = e.target;
        let isLink = false;
        const activated = [];
        while (node) {
            if (node.tagName.toLowerCase() == 'a') {
                isLink = true;
            }
            const match = activeElements.find((e) => e == node);
            if (match) {
                activated.push(match);
            }
            node = node.parentElement;
        }
        switch (activated[0]) {
            case $unfold:
                unfold();
                break;
            case $copy:
            case $input:
                copy();
                break;
            case $sideToc:
                if (isLink) {
                    close();
                }
                break;
            case $close:
            case $fade:
            case $html:
            default:
                close();
                break;
        }
    },
    false
);

function unfold() {
    $sidePanel.classList.remove('display-none');
    $fade.classList.remove('display-none');
    $html.classList.add('overflow-hidden');
}

function close() {
    $sidePanel.classList.add('display-none');
    $fade.classList.add('display-none');
    $html.classList.remove('overflow-hidden');
}

function copy() {
    const value = $input.value;
    $input.focus();
    $input.select();
    $input.setSelectionRange(0, value.length);
    navigator.clipboard.writeText(value);
}
