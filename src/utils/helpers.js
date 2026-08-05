export const parseNeedsTags = (needs) => {
  if (!needs) return [];
  let rawList = Array.isArray(needs) ? needs : [needs];
  const tags = [];
  rawList.forEach(str => {
    if (typeof str === 'string' && str.startsWith('[')) {
      try {
        const arr = JSON.parse(str);
        if (Array.isArray(arr)) {
          arr.forEach(a => { if (a && typeof a === 'string') tags.push(a.trim()); });
          return;
        }
      } catch(e) {}
    }
    if (typeof str === 'string') {
      // Split by commas, newlines, semicolons, pipes, bullets, or Assamese dandi (।)
      str.split(/[,;\n|•*।]/).forEach(s => {
        const trimmed = s.trim().replace(/^[-–—]\s*/, '');
        if (trimmed) tags.push(trimmed);
      });
    }
  });
  return tags;
};
