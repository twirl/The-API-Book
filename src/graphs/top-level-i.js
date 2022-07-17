(function (global) {
    global.render = (lib, l10n) => {
        const { graph } = lib.paper({
            width: 1000,
            height: 320
        });

        lib.group({
            graph,
            left: 10,
            top: 10,
            width: 980,
            height: 300,
            title: l10n.graphs.topLevel
        });
    };
})(this);
