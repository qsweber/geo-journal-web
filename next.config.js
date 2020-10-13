module.exports = {
  trailingSlash: true,
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      "/": {
        page: "/",
      },
      "/images": {
        page: "/images",
      },
    };
  },
};
