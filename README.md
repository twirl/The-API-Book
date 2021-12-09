# The API Book

This is the working repository for ‘The API’ book written by Sergey Konstantinov ([email](mailto:twirl-team@yandex.ru), [Linkedin profile](https://linkedin.com/in/twirl)).

You may find `.html`, `.epub` or `.pdf` version of the book in the `docs` folder, or read it online.
  * In English: [html](https://twirl.github.io/The-API-Book/docs/API.en.html), [epub](https://twirl.github.io/The-API-Book/docs/API.en.epub), [pdf](https://twirl.github.io/The-API-Book/docs/API.en.pdf)
  * In Russian: [html](https://twirl.github.io/The-API-Book/docs/API.ru.html), [epub](https://twirl.github.io/The-API-Book/docs/API.ru.epub), [pdf](https://twirl.github.io/The-API-Book/docs/API.ru.pdf)

Pre-compiled books above comprise clean-copy texts only. Drafts could be found in the `src` folder. Complete new chapter drafts will be published on:
  * my [medium](https://twirl.medium.com/) blog in English;
  * my [habr](https://habr.com/ru/users/forgotten/posts/) blog in Russian.

I'd appreciate if you share them on reddit, for I personally can't do that: reddit bans me for ‘self-promotion’.

The work is distributed under a Creative Commons Attribution-NonCommercial 4.0 license, meaning in general that you're totally free to use this book in any manner while complying with two rules:
  * you're not getting commercial profit from the book;
  * you're not forgetting to mention the author properly.

See full license in LICENSE.md file or at [Creative Commons Website](http://creativecommons.org/licenses/by-nc/4.0/).

You might support this work [on Patreon](https://www.patreon.com/yatwirl).

## Current State and the Roadmap

Right now Section I (‘API Design’) is finished. The Section is lacking readable schemes, I'll draw them later.

The book will contain two more sections.
  * Section II ‘Backwards Compatibility’ will cover growth issues. Major themes are:
    * major sources of problems leading to backwards compatibility breach;
    * interface decomposing allowing for third-party plugins and switching underlying technologies;
    * structuring public and private parts of your API;
    * versioning policies;
    * common mistakes.
  * Section III ‘API as a Product’ will be discussing non-technical issues:
    * what for the APIs exist;
    * monetizing APIs;
    * making sure your understand users' needs and collect proper metrics;
    * common practices, including AA issues and fraud problems;
    * organizing docs portal;
    * open source and community.

I also have more distant plans on adding two more subsections to Section I.
  * Section Ia ‘JSON HTTP APIs’:
    * the REST myth;
    * following HTTP spec, including those parts where you should not follow the spec;
    * best practices;
  * Section Ib ‘SDK Design’ covering more tricky issues of having proving UI alongside the API (no specific plan right now)

## Translation

I am translating new chapters into English at the moment they're ready. I'm not a native speaker, so feel free to correct my grammar.

## Contributing

I am accepting inquiries. Feel free to open issues.

I am NOT accepting pull requests introducing any new content, since I'm willing to be the only author. I would gratefully accept typo fixes, though.

Thanks @tholman for https://github.com/tholman/github-corners
