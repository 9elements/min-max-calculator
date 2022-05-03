<script>
  import { SvelteToast, toast } from "@zerodevx/svelte-toast"
  import CopyIcon from "../Icons/Copy.svelte"
  import styles from "./styles.module.css"

  let unit = "px" // or "rem"
  $: isRem = unit === "rem"
  let hasError = false

  let minValue = 24
  let maxValue = 80
  let minViewport = 500
  let maxViewport = 1000

  let result

  // Functions
  const toRem = (value) => +(isRem ? value : value / 16).toFixed(3)
  const toPx = (value) => +(isRem ? value * 16 : value).toFixed(3)

  const switchUnit = () => {
    const switchValue = (value) => (isRem ? toPx(value) : toRem(value))
    unit = unit === "px" ? "rem" : "px"

    minValue = switchValue(minValue)
    maxValue = switchValue(maxValue)
    minViewport = switchValue(minViewport)
    maxViewport = switchValue(maxViewport)
  }
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result).then(() =>
      toast.push("Copied to clipboard!", {
        duration: 2000,
        theme: {
          "--toastBackground": "#ccebd7",
          "--toastBarBackground": "#5bb98c",
          "--toastColor": "#153226",
          "--toastBorderRadius": "0.375rem",
        },
      })
    )
  }

  $: {
    // Write Result
    const variablePart = (maxValue - minValue) / (maxViewport - minViewport)
    const constant = toRem(+(maxValue - maxViewport * variablePart))

    result = `--variable-value: clamp(${toRem(
      minValue
    )}rem, calc(${constant}rem + ${+(100 * variablePart).toFixed(
      2
    )}vw), ${toRem(maxValue)}rem)`
  }
</script>

<div class={styles.wrapper} style={result}>
  <div class={styles.inputs}>
    <div class={styles.unitSwitcher}>
      <label for="unit">Use rem instead of px</label>
      <input type="checkbox" id="unit" on:change={switchUnit} />
    </div>

    <hr />

    <div class={styles.input}>
      <label for="min-value">
        Min value (can be negative, e.g. for margins)
      </label>
      <input
        type="number"
        id="min-value"
        bind:value={minValue}
        max={maxValue - 1}
      />
    </div>

    <div class={styles.input}>
      <label for="min-viewport">Min viewport</label>
      <input type="number" id="min-viewport" min={0} bind:value={minViewport} />
    </div>

    <hr />

    <div class={styles.input}>
      <label for="max-value">Max value</label>
      <input
        type="number"
        id="max-value"
        min={minValue + 1}
        bind:value={maxValue}
      />
    </div>

    <div class={styles.input}>
      <label for="max-viewport">Max viewport</label>
      <input type="number" id="max-viewport" min={0} bind:value={maxViewport} />
    </div>
  </div>

  {#if hasError}
    <div class={styles.errors}>
      <strong> there are errors </strong>
    </div>
  {:else}
    <code class={styles.output}>
      <span class={styles.outputCSS}>
        {result}
      </span>
      <button class={styles.copyButton} on:click={copyToClipboard}>
        <span class="sr-only">Copy snippet to clipboard</span>
        <CopyIcon />
      </button>
    </code>
  {/if}

  <div class={styles.box} />
</div>

<SvelteToast />
