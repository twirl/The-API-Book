window.onload = function () {
    let editor;
    let iframe;
    let selected;

    window.showExample = async (id) => {
        if (selected) {
            selected.classList.remove('selected');
        }
        selected = document.getElementById(`example-${id}`);
        selected.classList.add('selected');
        const code = await fetch(`samples/${id}.js`).then((res) => res.text());
        editor.setValue(code);
        runLiveExample(code);
    };

    document
        .getElementById('refresh')
        .addEventListener(
            'click',
            () => runLiveExample(editor.getValue()),
            false
        );

    window.runLiveExample = (code) => {
        if (iframe) {
            iframe.parentNode.removeChild(iframe);
        }
        iframe = document.createElement('iframe');
        iframe.srcdoc = `<!doctype html><html><head>
            <link rel="icon" type="image/png" href="../../assets/favicon.png" />
            <link rel="stylesheet" type="text/css" href="../../assets/fonts.css" />
            <link rel="stylesheet" type="text/css" href="./style.css" />
            <script type="text/javascript" src="./index.js"></script>
            <style>
                html, body {width: 100%; height: 100%; margin: 0; padding: 0; background-color: #F9F9F9;}
                body > img {display: block; height: 46px;}
                body > h1 {font-weight: bold; font-size: 17px; line-height: 46px;
                    letter-spacing: -0.408px; height: 46px; margin: 0; text-align: center;}
                #search-box {height: 408px; width: 390px; overflow: hidden;}
            </style>
            <script>
                window.onload = () => {
                    ${code}
                }
            </script></head><body>
                <img src="../../assets/app-header.png"/>
                <h1>Our Coffee SDK Example Application</h1>
                <div id="search-box"/>
            </body></html>`;
        document.getElementById('live-example').appendChild(iframe);
    };

    require.config({
        paths: { vs: '../../assets/monaco-editor/dev/vs' }
    });
    require(['vs/editor/editor.main'], function () {
        const editorContainer = document.getElementById('editor');
        editor = monaco.editor.create(editorContainer, {
            value: '',
            language: 'javascript',
            codeLens: false,
            fontFamily: 'local-monospace'
        });
        showExample('00');
    });
};
