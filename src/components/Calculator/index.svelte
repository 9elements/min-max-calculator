<script>
  import CopyIcon from "../Icons/Copy.svelte"
  import styles from "./styles.module.css"

  let unit = "px"
  $: isRem = unit === "rem"

  let minValue = 24
  let maxValue = 80
  let minViewport = 500
  let maxViewport = 1000

  let result

  // Functions
  const toRem = (value) => `${+(isRem ? value : value / 16).toFixed(2)}rem`
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    // To-Do: show a success message/toast
  }

  $: {
    const variablePart = (maxValue - minValue) / (maxViewport - minViewport)
    const constant = toRem(+(maxValue - maxViewport * variablePart))

    result = `
      --variable-value: clamp(${toRem(minValue)},
      calc(${constant} + ${+(100 * variablePart).toFixed(2)}vw),
      ${toRem(maxValue)})`
  }
</script>

<div class={styles.wrapper} style={result}>
  <div class={styles.inputs}>
    <div class={styles.unitSwitcher}>
      <!-- TODO: Make this work (unit conversion in inputs) -->
      <label for="unit">Use rem instead of px (TODO)</label>
      <input
        type="checkbox"
        id="unit"
        on:change={() => (unit = unit === "px" ? "rem" : "px")}
      />
    </div>

    <hr />

    <div class={styles.input}>
      <label for="min-value">Min value (can be negative)</label>
      <input type="number" id="min-value" bind:value={minValue} />
    </div>

    <div class={styles.input}>
      <label for="min-viewport">Min viewport</label>
      <input type="number" id="min-viewport" bind:value={minViewport} />
    </div>

    <hr />

    <div class={styles.input}>
      <label for="max-value">Max value</label>
      <input type="number" id="max-value" bind:value={maxValue} />
    </div>

    <div class={styles.input}>
      <label for="max-viewport">Max viewport</label>
      <input type="number" id="max-viewport" bind:value={maxViewport} />
    </div>
  </div>

  <div>
    <code class={styles.output}>
      {result}
      <button class={styles.copyButton} on:click={copyToClipboard}>
        <span class="sr-only">Copy snippet to clipboard</span>
        <CopyIcon />
      </button>
    </code>
  </div>

  <div class="box" />
</div>

<style>
  .box {
    width: var(--variable-value);
    height: var(--variable-value);

    background-color: lightcoral;
  }
</style>
