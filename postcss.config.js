module.exports = {
  plugins: {
    "@csstools/postcss-global-data": {
      files: ["./src/styles/_media.css"],
    },
    "postcss-preset-env": {
      stage: 3,
      features: {
        "nesting-rules": true,
        "prefers-color-scheme-query": false,
      },
    },
  },
}
