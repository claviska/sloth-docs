const Mustache = require('mustache');
const Promise = require('bluebird');
const cheerio = require('../cheerio');
const copy = require('recursive-copy');
const fs = require('fs').promises;
const frontMatter = require('front-matter');
const marked = require('marked');
const mkdirp = require('mkdirp');
const lunr = require('lunr');
const path = require('path');
const recursiveReadDir = require('recursive-readdir');
const md5 = require('md5');
const rootDir = path.dirname(path.dirname(__dirname));

async function buildPage(page, options) {
  const { config, sidebar } = options;
  const templateName = page.attributes.template || 'default';
  const templateHTML = await fs.readFile(path.join(config.theme, `templates/${templateName}.html`), 'utf8');
  const bodyHTML = marked(page.body);
  const sidebarHTML = marked(sidebar);
  const subnavHTML = generateSubnav(bodyHTML);

  // Render it
  let html = Mustache.render(templateHTML, {
    name: config.name,
    favicon: config.favicon,
    logo: config.logo,
    title: page.attributes.title,
    description: page.attributes.description,
    body: bodyHTML,
    sidebar: sidebarHTML,
    subnav: subnavHTML
  });

  html = runInjectionPlugins(html, config);

  // Create the target directory if it doesn't exist
  await mkdirp(path.dirname(page.filename));

  // Write the page
  return fs.writeFile(page.filename, html);
}

function generateSubnav(html) {
  const $ = cheerio.load(html);
  const subnavHeadings = $('h2, h3, h4, h5, h6');
  if (subnavHeadings.length) {
    const ul = $('<ul />');
    subnavHeadings.each((index, el) => {
      $('<li />')
        .append(
          $('<a />')
            .attr('href', '#' + $(el).attr('id'))
            .addClass(el.tagName.toLowerCase())
            .text($(el).text())
        )
        .appendTo(ul);
    });
    return $.html(ul);
  } else {
    return '';
  }
}

function runInjectionPlugins(html, config) {
  const $ = cheerio.load(html);

  // Run injection plugins
  if (Array.isArray(config.plugins)) {
    config.plugins.map(plugin => {
      if (plugin.injectIntoHead) {
        $('head').append(plugin.injectIntoHead());
      }

      if (plugin.injectIntoBody) {
        $('body').append(plugin.injectIntoBody());
      }
    });
  }

  return $.html();
}

module.exports = async function(config) {
  // Make the dist directory
  await mkdirp(config.dist);
  await mkdirp(path.join(config.dist, 'search'));

  // Load the sidebar
  let sidebar;
  try {
    sidebar = await fs.readFile(path.join(config.docs, config.sidebar), 'utf8');
  } catch {
    sidebar = '';
  }

  // Get page files, but ignore non-markdown files and files that start with _
  const files = (await recursiveReadDir(config.docs)).filter(file => {
    return path.basename(file).charAt(0) !== '_' && path.extname(file).toLowerCase() === '.md';
  });

  // Prepare pages
  const pages = await Promise.map(files, async filename => {
    const id = md5(filename);
    const data = await fs.readFile(filename, 'utf8');
    const { attributes, body } = frontMatter(data);

    return {
      id,
      filename: path.join(config.dist, path.relative(config.docs, filename.replace(/\.md$/i, '.html'))),
      attributes,
      body
    };
  });

  // Build a search index
  const searchIndex = {
    pageIndex: pages.map(page => {
      return {
        id: page.id,
        filename: path.relative(config.dist, page.filename),
        title: page.attributes.title,
        description: page.attributes.description
      };
    }),
    lunrIndex: lunr(function() {
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('description', { boost: 2 });
      this.field('body');

      pages.map(page =>
        this.add({
          id: page.id,
          filename: path.relative(config.dist, page.filename),
          title: page.attributes.title,
          description: page.attributes.description,
          body: page.body
        })
      );
    })
  };

  return Promise.all(
    // Copy theme files
    copy(path.join(config.theme, 'assets'), path.join(config.dist, 'assets'), {
      overwrite: true
    }),

    // Copy lunr.js
    copy(path.join(rootDir, './node_modules/lunr/lunr.min.js'), path.join(config.dist, 'search/lunr.min.js'), {
      overwrite: true
    }),

    // Write search index
    fs.writeFile(path.join(config.dist, 'search/index.json'), JSON.stringify(searchIndex)),

    // Build pages
    Promise.map(pages, page => buildPage(page, { config, sidebar }))
  );
};
