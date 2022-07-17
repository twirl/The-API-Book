(function (global) {
    global.lib = {};

    global.lib.paper = ({ height, width, id = 'content' }) => {
        const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

        const paper = new joint.dia.Paper({
            el: document.getElementById(id),
            model: graph,
            width,
            height,
            gridSize: 1,
            cellViewNamespace: joint.shapes
        });

        return { paper, graph };
    };

    global.lib.group = ({
        graph,
        height = 200,
        width = 800,
        title,
        left,
        top
    }) => {
        return new joint.shapes.standard.HeaderedRectangle()
            .resize(height, width)
            .position(left, top)
            .attr('root/title', title)
            .attr('headerText/text', title)
            .rotate(-90, true, { x: left + height / 2, y: top + height / 2 })
            .addTo(graph);
    };
})(this);
