const { JSDOM } = require("jsdom");

async function crawlPage(base_url, current_url, pages) {

  const base_url_obj = new URL(base_url);
  const current_url_obj = new URL(current_url);

  if(base_url_obj.hostname !== current_url_obj.hostname) {
    return pages;
  }

  const normalized_curr_url = normalizeURL(current_url);
  if(pages[normalized_curr_url > 0]) {
    pages[normalized_curr_url]++;
    return pages;
  }

  pages[normalized_curr_url] = 1;
  console.log(`crawling: ${current_url}}`);


  try {
    const resp = await fetch(current_url);

    if (resp.status > 399) {
      console.log(`error in fetch with status code: ${resp.status} on page ${current_url}`);
      return pages;
    }

    const content_type = resp.headers.get("content-type");
    if(!content_type.includes("text/html")) {
      console.log(`non-html response, content type: ${content_type} on page ${current_url}`);
      return pages;
    }

    const html_body = await resp.text();

    const next_urls = getURLsFromHTML(html_body, base_url);

    for(const next_url of next_urls) {
      pages = await crawlPage(base_url, next_url, pages);
    }
  } catch (error) {
    console.log(`error in fetch: ${error}, on page: ${current_url}`);
  }
  return pages;
}

function getURLsFromHTML(htmlBody, baseURL) {
  const urls = [];
  const dom = new JSDOM(htmlBody);
  const linkElements = dom.window.document.querySelectorAll("a");
  for (const linkElement of linkElements) {
    if (linkElement.href.slice(0, 1) === "/") {
      // relative URL
      try {
        const urlObj = new URL(`${baseURL}${linkElement.href}`);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`error with realative url: ${err.message}`);
      }
    } else {
      // absolute URL
      try {
        const urlObj = new URL(linkElement.href);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`error with absolute url: ${err.message}`);
      }
    }
  }
  return urls;
}

function normalizeURL(urlString) {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;

  if (hostPath.length > 0 && hostPath.slice(-1) === "/") {
    return hostPath.slice(0, -1);
  }

  return hostPath;
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage,
};
