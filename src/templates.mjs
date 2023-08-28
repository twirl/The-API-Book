import { readFileSync } from 'fs';
import { resolve } from 'path';

const escapeHtml = (str) =>
    str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');

export const templates = {
    pageBreak: '<div class="page-break"></div>',

    mainContent: (content) => `<section class="main-content">
<nav class="page-main"><ul class="nav-folded">
    <li class="share"></li>
    <li class="para">§</li>
</ul></nav>${content}</section>`,

    screenContent: (content, css, { structure, l10n, templates }) =>
        `${templates.sidePanel({
            structure,
            l10n,
            templates
        })}<article>${content}</article>${templates.mainScript(l10n)}`,

    mainScript: () =>
        `<script>${readFileSync(resolve('./src/scripts/sidebar.js'))}</script>`,

    referenceIsbnHref: (href, text, l10n) => {
        const isbn = escapeHtml(href.replace('isbn:', ''));
        return `<a target="_blank" class="external${
            text ? '' : ' text'
        }" href="https://isbnsearch.org/isbn/${isbn}">${l10n.isbn} ${isbn}</a>`;
    },

    sidePanel: ({
        structure,
        l10n,
        templates
    }) => `<div class="fade display-none"></div>
<aside class="side-panel display-none">
    <h3 class="title">${l10n.author}. ${l10n.title}</h3>
    ${templates.shareControl({ l10n, templates })}
    <section class="side-toc">${templates.toc(structure, l10n)}</section>
    <button type="button" class="close"></button></aside>`,

    shareControl: ({ l10n, templates }) => `<ul class="share text-align-left">
<li>${l10n.sidePanel.shareTo}:</li>
    ${l10n.sidePanel.services
        .map(
            ({ key, link }) =>
                `<li><a class="share share-${key}" href="${templates.shareLink(
                    link,
                    l10n.sidePanel.shareParameters
                )}" target="_blank"> </a></li>`
        )
        .join('')}
        <li class="copy-link">${
            l10n.sidePanel.copyLink
        }: <input type="text" value="${
        l10n.sidePanel.shareParameters.url
    }"/><button type="button" class="copy-button"></button></li>
</ul>`,

    shareLinks: ({ l10n, templates }) =>
        `${l10n.sidePanel.services
            .map(
                ({ key, link }) =>
                    `<a class="share share-${key}" href="${templates.shareLink(
                        link,
                        l10n.sidePanel.shareParameters
                    )}" target="_blank">${key}</a>`
            )
            .join(' · ')}`,

    frontPage: ({ templates, l10n }) => `
<div class="cover">
    <h1>
    <span class="author">${l10n.author}</span><br /><span class="title"
        >${l10n.frontPage.title}</span
    >
    </h1>
</div><div class="page-break"></div><div class="annotation"><p class="text-align-left">
    <strong>${l10n.author}. ${l10n.title}.</strong><br />
    <a target="_blank" href="mailto:${l10n.links.email}">${
        l10n.links.emailString
    }</a> &middot; <a target="_blank" href="${l10n.links.linkedinHref}">${
        l10n.links.linkedinString
    }</a> &middot; <a target="_blank" href="${l10n.links.substackHref}">${
        l10n.links.substackString
    }</a></p>
    ${l10n.frontPage.contents.join('\n')}
    <p class=\"text-align-left\">${
        l10n.sourceCodeAt
    } <a target="_blank" href="${l10n.links.githubHref}">${
        l10n.links.githubString
    }</a></p>
    </div><p class="share text-align-left">${
        l10n.sidePanel.shareTo
    }: ${templates.shareLinks({
        l10n,
        templates
    })}</p><div class="page-break"></div>`,

    shareLink: (link, parameters) => {
        let result = link;
        for (const [key, value] of Object.entries(parameters)) {
            result = result.replace(
                new RegExp(`\\$\\{${key}\\}`, 'g'),
                encodeURIComponent(value)
            );
        }
        return result;
    },

    landing: ({ structure, l10n, lang, templates, examples }) => {
        const link = (anchor, type = 'html') =>
            `${encodeURIComponent(l10n.file)}.${lang}.${type}${
                anchor ? '#' + anchor : ''
            }`;
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/png" href="assets/favicon.png" />
    <title>
        ${l10n.author}. ${l10n.title}
    </title>
    <meta
        name="description"
        content="${l10n.description}"
    />
    <meta property="og:type" content="article" />
    <meta
        property="og:title"
        content="${l10n.author}. ${l10n.title}"
    />
    <meta
        property="og:description"
        content="${l10n.description}"
    />
    <meta property="og:image" content="assets/header.png" />
    <meta
        property="og:url"
        content="${l10n.links.githubHref}"
    />
    <link rel="stylesheet" href="assets/fonts.css"/>
    <link rel="stylesheet" href="assets/landing.css"/>
</head>
<body>
    <nav>
        <img
            class="header"
            src="assets/header.jpg"
            alt="${l10n.author}. ${l10n.title}"
        /><br />
        <h1>${l10n.author}<br/><span class="title">${l10n.title}</span></h1>
        <h2>${l10n.landing.subTitle}</h2>
        <br />${l10n.landing.subscribeOn} ${l10n.landing.updates
            .map(
                (source) =>
                    `<a class="${source}" href="${
                        l10n.links[source + 'Href']
                    }">${l10n.links[source + 'Tag'] || ''}</a>`
            )
            .join(' · ')}
        ${
            l10n.landing.follow && l10n.landing.follow.length
                ? `<br/>${l10n.landing.followOn} ${l10n.landing.follow
                      .map(
                          (source) =>
                              `<a class="${source}" href="${
                                  l10n.links[source + 'Href']
                              }">${l10n.links[source + 'Tag'] || ''}</a>`
                      )
                      .join(' · ')}`
                : ''
        }
        <br />${l10n.landing.supportThisWork} ${l10n.landing.support
            .map(
                (source) =>
                    `<a class="${source}" href="${
                        l10n.links[source + 'Href']
                    }">${l10n.links[source + 'Tag'] || ''}</a>`
            )
            .join(' · ')}
        <br />${l10n.sidePanel.shareTo}: ${l10n.sidePanel.services
            .map(
                ({ key, link }) =>
                    `<a class="share share-${key}" href="${templates.shareLink(
                        link,
                        l10n.sidePanel.shareParameters
                    )}" target="_blank"></a>`
            )
            .join(' · ')}<br/>⚙️⚙️⚙️
    </nav>
    ${l10n.landing.content.join('\n')}
    <p>${l10n.landing.download} <a href="${link(
            null,
            'pdf'
        )}">PDF</a> / <a href="${link(null, 'epub')}">EPUB</a> ${
            l10n.landing.or
        } <a href="${link()}">${l10n.landing.readOnline}</a>.
    </p>
    <h3>${l10n.toc}</h3>
    <ul>${structure.sections
        .map(
            (section) => `<li>
                <h4><a href="${link(section.anchor)}">${section.title}</a></h4>
                ${
                    section.chapters.length
                        ? `<ul>
                    ${section.chapters
                        .map(
                            (chapter) =>
                                `<li><a href="${link(chapter.anchor)}">${
                                    chapter.title
                                }</a></li>`
                        )
                        .join('\n')}
                            </ul>`
                        : ''
                }
            </li>`
        )
        .join('\n')}
        <li>
            <h4>${l10n.landing.liveExamples}</h3>
            <ul>${examples
                .map(
                    ({ name, path }) => `<li><a href="${path}">${name}</a></li>`
                )
                .join('')}
            </ul>
        </li>
    </ul>
    <p>${l10n.landing.license}</p>
    <p>${l10n.sourceCodeAt} <a href="${l10n.links.githubHref}">${
            l10n.links.githubString
        }</a></p>
    <h3><a name="about-author">${l10n.aboutMe.title}</a></h3>
    <section class="about-me">
        <aside><img src="https://konstantinov.cc/static/me.png"/><br/>${
            l10n.aboutMe.imageCredit
        }</aside>
        <div class="content">
        ${l10n.aboutMe.content.join('\n')}</div>
    </section>
    ${l10n.landing.footer.join('\n')}
</body>
</html>`;
    },
    aImg: ({ src, href, title, alt, l10n, className = 'img-wrapper' }) => {
        const withCredit = alt != 'APP' && alt != 'PLOT';
        const fullTitle = escapeHtml(
            `${title}${title.at(-1).match(/[\.\?\!\)]/) ? ' ' : '. '}${
                withCredit ? ` ${l10n.imageCredit}: ${alt}` : ''
            }`
        );
        const fullClass =
            alt == 'APP' ? `${className} app-img-wrapper` : className;
        return `<div class="${escapeHtml(fullClass)}"><img src="${escapeHtml(
            src
        )}" alt="${fullTitle}" title="${fullTitle}"/><h6>${escapeHtml(title)}${
            withCredit
                ? `. ${escapeHtml(l10n.imageCredit)}: ${
                      href
                          ? `<a href="${escapeHtml(href)}">${escapeHtml(
                                alt
                            )}</a>`
                          : escapeHtml(alt)
                  }`
                : ''
        }
        </h6></div>`;
    },
    graphHtmlTemplate: (graph) => `<!DOCTYPE html>
<html>
    <head>
        <style>
            html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: auto;
            }
            
            @font-face {
                font-family: local-monospace;
                src: url(../src/fonts/RobotoMono-Regular.ttf);
            }
            
            .actor-line {
                stroke: lightgray;
                opacity: 0.2;
            }
        </style>
    </head>
    <body>
        <div class="mermaid">${graph
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</div>
        <script src="../src/scripts/mermaid.min.js"></script>
        <script>mermaid.initialize({
            theme: 'neutral',
            fontFamily: 'local-monospace, monospace',
            fontSize: 14,
            sequence: {
                diagramMarginX: 20,
                diagramMarginY: 10,
                actorMargin: 5,
                mirrorActors: false,
                showSequenceNumbers: true
            }
          });</script>
    </body>
</html>`
};