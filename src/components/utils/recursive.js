function recursiveHasRowUnselected(row) {
  return row.children.find(child => {
    if (!child.vgtSelected) return true;
    if (child.children) return recursiveHasRowUnselected(child);
    return false;
  });
}
function recursiveHasRowSelected(row) {
  return row.children.find(child => {
    if (child.vgtSelected) return true;
    if (child.children) return recursiveHasRowSelected(child);
    return false;
  });
}
function recursiveSelect(rows, newValue, vueSetFunction) {
  rows.forEach(row => {
    vueSetFunction(row, "vgtSelected", newValue);
    if (row.children) recursiveSelect(row.children, newValue, vueSetFunction);
  });
}

export { recursiveHasRowSelected, recursiveHasRowUnselected, recursiveSelect };
