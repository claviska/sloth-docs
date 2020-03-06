# Sloth Docs 🦥 📚

A documentation generator powered by Node.js and sloths.

- Converts markdown and generates static HTML files 🌱
- Supports custom themes and templates 🎨
- Runs via CLI so you don't clutter up your app directory 🧹
- Integrated dev server so you can see changes as you edit ✨
- Built-in full-text search 🔍
- Pluggable 🔌

## TODO

This project is a work in progress. There are still some things left to do:

- [ ] Make the default theme prettier
- [ ] Add a CLI command to initialize a new docs project
  - [ ] Generate `sloth-docs.config.js` if it doesn't exist
  - [ ] Copy `README.md` to `docs/home.md` if it does exist
- [ ] Add more plugin hooks
  - [ ] Hook to modify markdown before it's parsed
  - [ ] Hook to modify HTML before it's written to file
- [ ] Add a `baseUrl` config so the docs can be more easily hosted in a subdirectory

## Installation

It's recommended to install the CLI globally.

```shell
npm install -g sloth-docs
```

## Configuration

You can run the CLI without a config, but if you want to change the default config, create `sloth-docs.config.js` in the root of your project with one or more of the following options:

```js
module.exports = {
  // The name of your docs site
  name: 'Sloth Docs',

  // The docs site favicon URL
  favicon: '/assets/favicon.png',

  // The docs site logo URL
  logo: '/assets/sloth.svg',

  // The directory that contains your markdown files
  docs: 'docs',

  // The directory where docs will be published to (WARNING! This directory is deleted and recreated on every build)
  dist: 'dist',

  // The name of the sidebar file
  sidebar: '_sidebar.md',

  // The directory that contains the theme you want to use (defaults to the built-in theme)
  theme: 'your-theme-folder',

  // Optional plugins
  plugins: []
};
```

## Usage

Run the CLI from the same directory as `sloth-docs.config.js`. The following commands are available.

```shell
# Launch the dev server and watch files
sloth-docs --serve

# Build the docs
sloth-docs --build

# Clean the dist directory
sloth-docs --clean

# List all options
sloth-docs --help
```

## Creating Pages

Add pages by creating markdown files in your `docs` directory. Here's a sample file with all supported [front matter](https://github.com/jxson/front-matter) properties.

```
---
title: Sloths Can Swim
description: Sloths are actually pretty fast swimmers!
template: default
---

# Sloths Can Swim

Lorem ipsum dolor amet...

```

Keep in mind that `<h1>` is a special tag and should only appear once at the very top of each page.

## Creating a Theme

To create a theme, create a folder with the following structure:

```
- my-theme/
  - assets/
  - templates/
    - default.html
```

### Templates

Every theme _must_ have a default template called `default.html`. You can create additional templates and set them using front matter as shown above. Just use the name of the template file _without_ an extension. For example, if your template is called `custom-template.html` use `template: custom-template` in your front matter.

Your template needs to tell the sloths _where_ things should go. Do this with the following [Mustache](https://mustache.github.io/) tags.

- `{{name}}` - The name of the docs site
- `{{favicon}}` - The favicon URL, e.g. `<link rel="icon" rel="{{favicon}}" type="image/x-icon" />`
- `{{logo}}` - The logo URL, e.g. `<img src="{{logo}}" alt="{{name}}">`
- `{{title}}` - The page title, e.g. `<title>{{title}}</title>`
- `{{description}}` - The page description, e.g. `<meta name="description" content="{{description}}">`
- `{{{body}}}` - The body HTML
- `{{{sidebar}}}` - The sidebar HTML
- `{{{subnav}}}` - The subnav HTML

Note the triple brackets for `body`, `sidebar`, and `subnav`. This is required so the HTML isn't escaped by the Mustache engine.

If any of the tags are omitted, the sloths will simply ignore them. Refer to `src/themes/default/templates/default.html` for an example.

### Assets

During build, everything in the `assets` folder will be copied to the `dist` directory. This is where you can put styles, scripts, images, and other publicly accessible resources.

## Search

A [Lunr](https://lunrjs.com/) search index is generated on every build and placed in `dist/search/index.json`. This allows you to provide a robust client-side search without the need for a third-party service. Next to the search index you'll also find `dist/search/lunr.min.js` which can be used to power the search.

For an example of how search works, check out Lunr's documentation. You can also refer to `src/themes/default/assets/search.js` for an example.

## Creating a Plugin

Plugins look something like this.

```js
module.exports = {
  name: 'Moar Sloths',
  author: 'Slothy McSloth',
  version: '0.0.0',

  // Content to be injected into the <body> of every page
  injectIntoBody() {
    return `
      <script src="your-script.js"></script>
    `;
  },

  // Content to be injected into the <head> of every page
  injectIntoHead() {
    return `
      <link rel="stylesheet" href="your-styles.css" />
    `;
  }
};
```

Add them to `sloth-docs.config.js` like this:

```js
module.exports = {
  // ...
  plugins: [require('your-first-plugin.js'), require('your-second-plugin.js')]
};
```
