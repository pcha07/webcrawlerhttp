function printReport(pages) {
  console.log("============");
  console.log("report");
  console.log("============");
  const sorted_pages = sortPages(pages);

  for (const sorted_page of sorted_pages) {
    const url = sorted_page[0];
    const hits = sorted_page[1];
    console.log(`found ${hits} links to page: ${url}`);
  }

  console.log("============");
  console.log("end report");
  console.log("============");
}

function sortPages(pages) {
  pages_arr = Object.entries(pages);
  pages_arr.sort((a, b) => {
    a_hits = a[1];
    b_hits = b[1];
    return b[1] - a[1];
  });

  return pages_arr;
}

module.exports = {
  sortPages,
  printReport
};
