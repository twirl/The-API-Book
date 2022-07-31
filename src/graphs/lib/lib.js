(function (global) {
    const lib = (global.lib = {});

    lib.group = ({ parent, height, width, title, left, top }) => {
        const element = document.createElement('div');
        element.classList.add('position-absolute');
        element.innerHTML = 
    };

    lib.entity = ({ parent, height, width, title, left, top, items }) => {
        return new joint.shapes.standard.HeaderedRectangle()
            .resize(width, height)
            .position(left, top)
            .attr('root/title', title)
            .attr('header/fill', 'lightgray')
            .attr('headerText/text', title)
            .attr('bodyText/text', items.join('\n'))
            .addTo(graph);
    };
})(this);
