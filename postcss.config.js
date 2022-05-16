module.exports = {
  plugins: {
    "postcss-preset-env": {
      stage: 3,
      features: {
        "nesting-rules": true,
        "prefers-color-scheme-query": false,
        "custom-media-queries": {
          importFrom: "./src/styles/_media.css",
        },
      },
    },
  },
}
