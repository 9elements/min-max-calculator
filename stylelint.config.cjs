module.exports = {
  extends: ["stylelint-config-recommended", "stylelint-config-idiomatic-order"],
  plugins: ["stylelint-use-logical-spec"],
  rules: {
    "declaration-property-value-no-unknown": true,
    "comment-empty-line-before": null,
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
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global"],
      },
    ],
    "liberty/use-logical-spec": true,
  },
}
