const templates = (module.exports = {
    pageBreak: '<div class="page-break"></div>',

    frontPage: (l10n) => `
<div class="cover">
    <h1>
    <span class="author">${l10n.author}</span><br /><span class="title"
        >${l10n.frontPage.title}</span
    >
    </h1>
</div><div class="page-break"></div><div class="annotation"><p>
    <strong>${l10n.author}. ${l10n.title}.</strong><br />
    <a target="_blank" href="mailto:${l10n.links.email}">${
        l10n.links.emailString
    }</a> &middot; <a target="_blank" href="${l10n.links.linkedinHref}">${
        l10n.links.linkedinString
    }</a> &middot; <a target="_blank" href="${l10n.links.patreonHref}">${
        l10n.links.patreonString
    }</a></p>
    ${l10n.frontPage.contents.join('\n')}
    <p>${l10n.sourceCodeAt} <a target="_blank" href="${
        l10n.links.githubHref
    }">${l10n.links.githubString}</a></p>
</div><div class="page-break"></div>`,

    landing: (structure, l10n, lang) => {
        const link = (anchor, type = 'html') =>
            `${encodeURIComponent(l10n.file)}.${lang}.${type}${
                anchor ? '#' + anchor : ''
            }`;
        let chapterCounter = 0;
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
            .join(' &middot; ')}
        ${
            l10n.landing.follow && l10n.landing.follow.length
                ? `<br/>${l10n.landing.followOn} ${l10n.landing.follow
                      .map(
                          (source) =>
                              `<a class="${source}" href="${
                                  l10n.links[source + 'Href']
                              }">${l10n.links[source + 'Tag'] || ''}</a>`
                      )
                      .join(' &middot; ')}`
                : ''
        }
        <br />${l10n.landing.supportThisWork} ${l10n.landing.support
            .map(
                (source) =>
                    `<a class="${source}" href="${
                        l10n.links[source + 'Href']
                    }">${l10n.links[source + 'Tag'] || ''}</a>`
            )
            .join(' &middot; ')}
        <br />⚙️⚙️⚙️
    </nav>
    ${l10n.landing.content.join('\n')}
    <p>${l10n.landing.download} <a href="${link(
            null,
            'pdf'
        )}">PDF</a>, <a href="${link(null, 'epub')}">EPUB</a>, ${
            l10n.landing.or
        } <a href="${link()}">${l10n.landing.readOnline}</a>.
    </p>
    <h3>${l10n.toc}</h3>
    <ul>${l10n.contents
        .map((section, i) => {
            const written = structure.sections[i];
            return `<li>
                <h4>${
                    written
                        ? `<a href="${link(written.anchor)}">${
                              written.title
                          }</a>`
                        : `${section.title}`
                }</h4>
                ${
                    section.chapters.length
                        ? `<ul>
                    ${section.chapters
                        .map((chapter, j) => {
                            const writtenChapter =
                                written && written.chapters[j];
                            chapterCounter++;
                            return writtenChapter
                                ? `<li><a href="${link(
                                      writtenChapter.anchor
                                  )}">${writtenChapter.title}</a></li>`
                                : `<li>${l10n.chapter} ${chapterCounter}. ${chapter}</li>`;
                        })
                        .join('\n')}
                            </ul>`
                        : ''
                }
            </li>`;
        })
        .join('\n')}
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
    }
});
