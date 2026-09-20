# JavaAtlas Foundation Design

## Goal

Create JavaAtlas as an independent Java reverse-reference site derived from the proven CSharpAtlas interaction model, while keeping Java-specific version compatibility first-class from the start.

The foundation phase should establish the application shell, content schema, localization, search/filter infrastructure, learning-map infrastructure, tests, and CI. It should not attempt to ship the full initial article corpus yet.

## Scope

### In scope

- Vite + Vanilla JavaScript frontend
- Japanese and English UI/locales
- Client-side article loading and search
- Article categories:
  - `concepts`
  - `code-recipes`
  - `exceptions`
  - `compiler-errors`
  - `compiler-warnings`
  - `logic-errors`
- Java version metadata and filtering
- Favorites and recent-history local state
- Learning-map shell and chapter model
- Wiki-style article links
- Content validation tests
- Learning-map reference validation tests
- GitHub Actions CI running tests and production build
- Cloudflare Pages-compatible static output

### Out of scope for foundation

- Full 40+ article corpus
- Playground / remote compiler
- Backend database
- User accounts or cloud sync
- Shared package extraction with CSharpAtlas
- Automatic synchronization with CSharpAtlas

## Architecture

JavaAtlas is an independent repository. The frontend architecture follows CSharpAtlas closely enough to reuse proven UI and data-loading ideas, but no runtime dependency on CSharpAtlas is introduced.

The site remains fully static:

- Vite builds the frontend.
- Article and locale data live in JSON under `public/content`.
- Filtering, search, favorites, recents, and learning-map rendering run in the browser.
- Cloudflare Pages can deploy `dist/` directly.

## Article data model

Base article records use the following shape:

```json
{
  "id": "stream-to-list",
  "type": "code",
  "since": 16,
  "until": null,
  "status": "standard",
  "bad": null,
  "good": null,
  "code": "var result = stream.toList();",
  "related": ["stream-basics"],
  "topics": ["streams", "collections"]
}
```

Required base fields:

- `id`: stable unique article ID
- `type`: one of the supported article types
- `since`: minimum Java release where the documented API/syntax is available
- `until`: last supported Java release when relevant, otherwise `null`
- `status`: `standard`, `preview`, or `deprecated`
- `bad`, `good`, `code`: string or `null`
- `related`: existing article IDs
- `topics`: stable discovery topic IDs

Localized article data contains:

- `title`
- `short`
- `summary`
- `why`
- `tips`
- `tags`

Japanese is the fallback locale and English should fully cover the shipped corpus.

## Java version compatibility

The latest design target is Java 27, while compatibility remains visible for older releases.

Initial version filter choices:

- All
- Java 8
- Java 11
- Java 17
- Java 21
- Java 25
- Java 27

Selecting Java version `V` shows an article when:

- `since <= V`, and
- `until` is `null` or `V <= until`.

Preview content is not silently treated as ordinary compatible content. Preview visibility is controlled separately so an article that requires preview flags cannot appear indistinguishable from a standard API.

The selected version is shareable through URL state using `version=<release>`.

## Discovery and personal navigation

JavaAtlas keeps the same separation as CSharpAtlas:

- Search and shareable filters are represented in the URL.
- Favorites and recent history are stored locally and are not part of shareable URL state.

Search should cover visible discovery metadata such as title, short description, ID, tags, and topics rather than hidden long-form body text.

## Learning map

The learning map is curated learning order, not a complete article index.

Initial chapter structure:

1. Java Basics
2. Types & OOP
3. Collections & Generics
4. Exceptions
5. Streams & Optional
6. I/O
7. Concurrency
8. Modern Java

Main nodes represent concepts, APIs, or practical patterns and carry representative Java code plus optional prerequisites.

Support nodes represent exceptions, compiler failures, and common logic mistakes and attach to a relevant main node using `attachedTo`.

The map must remain intentionally smaller than the full article corpus.

## Initial content strategy

After the foundation is working, the first content milestone should target roughly 40 high-value articles distributed across basics/OOP, collections/generics, exceptions, streams/Optional, I/O, concurrency, and modern Java.

The foundation itself may include only a minimal seed corpus sufficient to exercise every category, version filter, localization path, and learning-map behavior.

## Testing

Development follows TDD.

The foundation test suite should verify at minimum:

- content IDs are unique
- article types are valid
- required fields exist
- Japanese and English locales cover all articles
- localized titles are not duplicated
- `related` references target existing articles
- `since`, `until`, and `status` are valid
- version filtering handles boundaries correctly
- preview articles require explicit preview visibility
- URL version state parses and serializes correctly
- learning-map node IDs reference existing articles
- prerequisite references exist in the same chapter or approved graph scope
- support nodes attach to valid main nodes
- search behavior uses discovery metadata
- favorites and recents remain local/personal state

## CI

GitHub Actions runs on pull requests and pushes:

1. `npm install`
2. `npm test`
3. `npm run build`

A failing test prevents build success from being reported as green.

## Repository workflow

Foundation work should be implemented on a dedicated branch and opened as a Draft PR against `main`.

Do not merge automatically and do not mark the PR ready for review without explicit user instruction.

## Success criteria

The foundation is complete when:

- the site builds and runs as a static Vite app
- ja/en localization works
- Java version filtering works and is shareable
- preview visibility is distinct from standard compatibility
- search/favorites/recents infrastructure works
- learning-map infrastructure renders and validates references
- seed content passes corpus validation
- GitHub Actions tests and build are green
- the work remains in a Draft PR for review
