import { resolve } from 'node:path';
import { readdir, writeFile } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { Path, Structure } from './builder-model';
import {
    CustomTemplates,
    Example,
    ExtraStrings,
    linker,
    shareLink,
    toc
} from './templates';

export const buildLanding = async ({
    structure,
    examplesDir,
    lang,
    outFile,
    strings,
    templates
}: LandingParameters) => {
    const examples = await readdir(examplesDir);

    const landingHtml = await landingTemplate(
        {
            structure,
            strings,
            lang,
            templates
        },
        examples.reduce((examples: Example[], folder) => {
            const fullName = resolve(examplesDir, folder);
            if (statSync(fullName).isDirectory()) {
                const name = folder.match(/^\d+\. (.+)$/)![1];
                examples.push({
                    name,
                    path: `examples/${folder}` as Path
                });
            }
            return examples;
        }, [])
    );
    await writeFile(outFile, landingHtml);
};

export const landingTemplate = async (
    {
        structure,
        strings,
        lang,
        templates
    }: Omit<LandingParameters, 'examplesDir' | 'outFile'>,
    examples: Example[]
) => {
    const link = linker(strings, lang);
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" type="image/png" href="assets/favicon.png" />
<title>
    ${strings.author}. ${strings.title}
</title>
<meta
    name="description"
    content="${strings.description}"
/>
<meta property="og:type" content="article" />
<meta
    property="og:title"
    content="${strings.author}. ${strings.title}"
/>
<meta
    property="og:description"
    content="${strings.description}"
/>
<meta property="og:image" content="assets/header.png" />
<meta
    property="og:url"
    content="${strings.links.githubHref}"
/>
<link rel="stylesheet" href="assets/fonts.css"/>
<link rel="stylesheet" href="assets/landing.css"/>
</head>
<body>
<nav>
    <img
        class="header"
        src="assets/header.jpg"
        alt="${strings.author}. ${strings.title}"
    /><br />
    <header>
        <h1>${strings.author}<br/><span class="title">${
        strings.title
    }</span></h1>
        ${
            strings.landing.subTitle
                ? `<h2>${strings.landing.subTitle}</h2>`
                : ''
        }
    </header>
    <br />${strings.landing.subscribeOn} ${strings.landing.updates
        .map(
            (source) =>
                `<a class="${source}" href="${
                    strings.links[source + 'Href']
                }">${strings.links[source + 'Tag'] || ''}</a>`
        )
        .join(' · ')}
    ${
        strings.landing.follow && strings.landing.follow.length
            ? `<br/>${strings.landing.followOn} ${strings.landing.follow
                  .map(
                      (source) =>
                          `<a class="${source}" href="${
                              strings.links[source + 'Href']
                          }">${strings.links[source + 'Tag'] || ''}</a>`
                  )
                  .join(' · ')}`
            : ''
    }
    <br />${strings.landing.supportThisWork} ${strings.landing.support
        .map(
            (source) =>
                `<a class="${source}" href="${
                    strings.links[source + 'Href']
                }">${strings.links[source + 'Tag'] || ''}</a>`
        )
        .join(' · ')}
    <br />${strings.sidePanel.shareTo}: ${strings.sidePanel.services
        .map(
            ({ key, link }) =>
                `<a class="share share-${key}" href="${shareLink(
                    link,
                    strings.sidePanel.shareParameters
                )}" target="_blank"></a>`
        )
        .join(' · ')}<br/>⚙️⚙️⚙️
</nav>
${strings.landing.content.join('\n')}
${
    strings.landing.download
        ? `<p>${strings.landing.download} <a href="${link(
              undefined,
              'pdf'
          )}">PDF</a> / <a href="${link(undefined, 'epub')}">EPUB</a> ${
              strings.landing.or
          } <a href="${link()}">${strings.landing.readOnline}</a>.
</p>`
        : `<p>${strings.landing.readOnline}.</p>`
}
<h3>${strings.toc}</h3>
${await toc({ structure, strings, templates, lang }, examples)}
<p>${strings.landing.license}</p>
<p>${strings.sourceCodeAt} <a href="${strings.links.githubHref}">${
        strings.links.githubString
    }</a></p>
<h3><a name="about-author">${strings.aboutMe.title}</a></h3>
<section class="about-me">
    <aside><img src="https://konstantinov.cc/static/me.png"/><br/>${
        strings.aboutMe.imageCredit
    }</aside>
    <div class="content">
    ${strings.aboutMe.content.join('\n')}</div>
</section>
${strings.landing.footer.join('\n')}
</body>
</html>`;
};

export interface LandingParameters {
    structure: Structure;
    examplesDir: Path;
    lang: string;
    outFile: Path;
    strings: ExtraStrings;
    templates: CustomTemplates;
}
