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

- [ ] CLI command to initialize
  - [ ] Generate `slothdocs.config.js` if it doesn't exist
  - [ ] Copy `README.md` to `docs/home.md` if it does exist
- [ ] Improve the default theme
  - [ ] Make it prettier
  - [ ] Make it responsive
  - [ ] Make the logo and alt text customizable via config
- [ ] Add more plugin hooks
  - [ ] Hook to modify markdown before it's parsed
  - [ ] Hook to modify HTML before it's written to file

## Installation

It's recommended to install the CLI globally.

```shell
npm install -g slothdocs
```

## Configuration

You can run the CLI without a config, but if you want to change the default config, create `slothdocs.config.js` in the root of your project with one or more of the following options:

```js
module.exports = {
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

Run the CLI from the same directory as `slothdocs.config.js`. The following commands are available.

```shell
# Launch the dev server and watch files
slothdocs --serve

# Build the docs
slothdocs --build

# Clean the dist directory
slothdocs --clean

# List all options
slothdocs --help
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

Your template needs to tell the sloths _where_ things should go. Do this with the following tags:

- `<title>` - receives the `title` front matter
- `<meta name="description">` - receives the `description` front matter
- `<nav data-slothdocs="sidebar">` - receives the sidebar
- `<div data-slothdocs="body">` - receives the body of the markdown file (i.e. the actual content)
- `<nav data-slothdocs="subnav"></nav>` - receives the subnav (i.e. the generated in-page nav)

If any of these tags are omitted, the sloths will just ignore them. Refer to `src/themes/default/templates/default.html` for an example.

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

Add them to `slothdocs.config.js` like this:

```js
module.exports = {
  // ...
  plugins: [require('your-first-plugin.js'), require('your-second-plugin.js')]
};
```
