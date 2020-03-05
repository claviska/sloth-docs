//
// A version of Cheerio that encodes entities with more sanity.
//
// This module provides a copy of Cheerio with monkey patched methods that decode HTML entities
// outside of the ASCII range. This means non-Latin characters, smart quotes, et al won't be encoded
// in the resulting HTML.
//
// See: https://github.com/cheeriojs/cheerio/issues/866
//
// It should be noted that using { decodeEntities: false } is an improper solution as it decodes all
// entities, exposing the potential for XSS vulnerabilities.
//
// Inspired by: https://github.com/cheeriojs/cheerio/issues/866#issuecomment-275699121
//
// Tested with Cheerio versions: 0.22.0, 1.0.0-rc.1, 1.0.0-rc.2
//
// Example:
//
//  const $ = cheerio.load('<p>Here’s a “quote” for ‘you’</p>');
//
//  console.log(
//    $.html(),
//    $.root().html(),
//    $('p').html()
//  );
//
// Output without patch:
//
//  <html><head></head><body><p>Here&#x2019;s a &#x201C;quote&#x201D; for &#x2018;you&#x2019;</p></body></html>
//  <html><head></head><body><p>Here&#x2019;s a &#x201C;quote&#x201D; for &#x2018;you&#x2019;</p></body></html>
//  Here&#x2019;s a &#x201C;quote&#x201D; for &#x2018;you&#x2019;
//
// Output with patch:
//
//  <html><head></head><body><p>Here’s a “quote” for ‘you’</p></body></html>
//  <html><head></head><body><p>Here’s a “quote” for ‘you’</p></body></html>
//  Here’s a “quote” for ‘you’
//
const cheerio = require('cheerio');
const load = cheerio.load;

function decode(string) {
  return string.replace(/&#x([0-9a-f]{1,6});/gi, (entity, code) => {
    code = parseInt(code, 16);

    // Don't unescape ASCII characters, assuming they're encoded for a good reason
    if (code < 0x80) return entity;

    return String.fromCodePoint(code);
  });
}

function wrapHtml(fn) {
  return function() {
    const result = fn.apply(this, arguments);
    return typeof result === 'string' ? decode(result) : result;
  };
}

cheerio.load = function() {
  const instance = load.apply(this, arguments);

  instance.html = wrapHtml(instance.html);
  instance.prototype.html = wrapHtml(instance.prototype.html);

  return instance;
};

module.exports = cheerio;
