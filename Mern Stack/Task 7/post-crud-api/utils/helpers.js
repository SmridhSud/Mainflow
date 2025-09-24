module.exports = {
  sanitizeTags: (tags) => (Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()) : [])
};
