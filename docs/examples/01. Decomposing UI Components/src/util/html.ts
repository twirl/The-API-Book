export function $<T extends Element>(
    ...args: [HTMLElement, string] | [string]
): T {
    const [node, selector] = args.length === 2 ? args : [document, args[0]];
    const result = node.querySelector(selector);
    if (!result) {
        throw new Error(`Cannot select a node with "${selector}" selector`);
    }
    return <T>result;
}

export function makeTemplate(e: (str: string) => string) {
    return (
        texts: TemplateStringsArray,
        ...substitutes: Array<
            string | HtmlSerializable | Array<string | HtmlSerializable>
        >
    ): HtmlSerializable => {
        const parts: string[] = [];
        for (let i = 0; i < texts.length; i++) {
            parts.push(texts[i]);
            if (substitutes[i]) {
                parts.push(getSubstituteValue(substitutes[i], e));
            }
        }
        return new HtmlSerializable(parts.join(''));
    };
}

export class HtmlSerializable {
    public __isHtmlSerializable: boolean;
    constructor(private readonly __html: string) {
        this.__isHtmlSerializable = true;
    }
    toString(): string {
        return this.__html;
    }
}

export function getSubstituteValue(
    value: string | HtmlSerializable | Array<string | HtmlSerializable>,
    escapeFunction: (str: string) => string
): string {
    if (typeof value == 'string') {
        return escapeFunction(value);
    } else if ((<HtmlSerializable>value).__isHtmlSerializable) {
        return value.toString();
    } else {
        return (<Array<string | HtmlSerializable>>value)
            .map((v) => getSubstituteValue(v, escapeFunction))
            .join('');
    }
}

export function htmlEscape(str: string): string {
    return str
        .replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;');
}

export function attrEscape(str: string): string {
    return htmlEscape(str).replace(/\'/g, '&#39;').replace(/\"/g, '&quot;');
}

export function hrefEscapeBuilder(
    allowedProtocols = ['http:', 'https:', null]
) {
    return (raw: string) => {
        const str = raw.trim();
        const protocol = str.match(/$[a-z0-9\+\-\.]+\:/i)[0] ?? null;
        if (allowedProtocols.includes(protocol)) {
            return attrEscape(str);
        } else {
            return '';
        }
    };
}

export const httpHrefEscape = hrefEscapeBuilder();

export const html = makeTemplate(htmlEscape);
export const raw = (str: string) => new HtmlSerializable(str);
export const attr = makeTemplate(attrEscape);
export const attrValue = (str: string) => new HtmlSerializable(attrEscape(str));
export const href = makeTemplate(httpHrefEscape);
export const hrefValue = (
    str: string,
    allowedProtocols?: Array<string | null>
) =>
    new HtmlSerializable(
        allowedProtocols === undefined
            ? httpHrefEscape(str)
            : hrefEscapeBuilder(allowedProtocols)(str)
    );
