/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // @qsweber/auth-kit ships raw TS/TSX source rather than a prebuilt dist,
  // so Next's own compiler is the only thing that ever compiles its
  // Emotion styled-components (consistent with this app's own).
  transpilePackages: ["@qsweber/auth-kit"],
};

module.exports = nextConfig;
