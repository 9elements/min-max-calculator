module.exports = {
  extends: ["stylelint-config-recommended", "stylelint-config-idiomatic-order"],
  plugins: ["stylelint-use-logical-spec"],
  rules: {
    "liberty/use-logical-spec": ["always"],
    "comment-empty-line-before": null,
    "declaration-block-trailing-semicolon": null,
    "no-descending-specificity": null,
    "rule-empty-line-before": [
      "always",
      {
        except: ["first-nested"],
        ignore: ["after-comment"],
      },
    ],
    "at-rule-empty-line-before": [
      "always",
      {
        except: ["first-nested", "blockless-after-same-name-blockless"],
        ignore: ["after-comment"],
      },
    ],
  },
}
