export const apiHighlight = (hljs) => {
    const ATTRIBUTE = {
        begin: /(?<!":\s*)"(\\.|[^\\"\r\n])*"/,
        className: 'attr'
    };
    const PUNCTUATION = {
        match: /{}[[\],:]/,
        className: 'punctuation'
    };
    const LITERALS = ['true', 'false', 'null'];
    const LITERALS_MODE = {
        scope: 'literal',
        beginKeywords: LITERALS.join(' ')
    };

    return {
        name: 'json',
        keywords: {
            keyword: 'GET POST PUT PATCH DELETE → …',
            literal: LITERALS
        },
        contains: [
            ATTRIBUTE,
            {
                scope: 'string',
                begin: /(?!^:\s*)"/,
                end: '"'
            },
            {
                match: /{[\w\d-_]+}|<[\w\d-_\s\\n]+>/,
                className: 'substitution'
            },
            PUNCTUATION,
            LITERALS_MODE,
            hljs.C_NUMBER_MODE,
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE
        ]
    };
};
