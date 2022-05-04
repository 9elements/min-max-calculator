<script>
  import { SvelteToast, toast } from "@zerodevx/svelte-toast"
  import CopyIcon from "../Icons/Copy.svelte"
  import styles from "./styles.module.css"

  let unit = "px" // or "rem"
  $: isRem = unit === "rem"
  const toRem = (value) => +(isRem ? value : value / 16).toFixed(3)
  const toPx = (value) => +(isRem ? value * 16 : value).toFixed(3)
  const switchToCurrentValue = (value) => (isRem ? toRem(value) : toPx(value))

  let minValue = 24
  let maxValue = 80
  let minViewportPx = 500
  let maxViewportPx = 1000
  $: minViewport = switchToCurrentValue(minViewportPx)
  $: maxViewport = switchToCurrentValue(maxViewportPx)

  $: hasError = minValue > maxValue || maxViewportPx < 1 || minViewportPx < 0
  $: hasNegative = minViewportPx < 0 || maxViewportPx < 1

  let result

  // Functions

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
      })
    )
  }

  $: {
    // Write Result
    const variablePart = (maxValue - minValue) / (maxViewport - minViewport)
    const constant = toRem(+(maxValue - maxViewport * variablePart))
    // prettier-ignore
    result = `--variable-value: clamp(${toRem(minValue)}rem, calc(${constant}rem + ${+(100 * variablePart).toFixed(2)}vw), ${toRem(maxValue)}rem)`
  }
</script>

<div class={styles.wrapper} style={result}>
  <form on:submit|preventDefault class={styles.inputs}>
    <div class={styles.unitToggleWrapper}>
      <label for="unit" class="sr-only">Use rem instead of px</label>
      <div class={styles.unitToggle} aria-hidden="true">
        <input
          type="checkbox"
          id="unit"
          on:change={switchUnit}
          class={styles.unitCheckbox}
        />
        <span class={styles.unitToggleBg} />
        <span class={styles.unitToggleText}>px</span>
        <span class={styles.unitToggleText}>rem</span>
      </div>
    </div>

    <div class={styles.input}>
      <label for="min-value">
        Min value <br /> <small> (can be negative, e.g. for margins) </small>
      </label>
      <div>
        <input
          type="number"
          id="min-value"
          bind:value={minValue}
          max={maxValue - 1}
        />
        {unit}
      </div>
    </div>

    <div class={styles.input}>
      <label for="max-value">Max value</label>
      <div>
        <input
          type="number"
          id="max-value"
          min={minValue + 1}
          bind:value={maxValue}
        />
        {unit}
      </div>
    </div>

    <hr />

    <div class={styles.input}>
      <label for="min-viewport">Min viewport</label>
      <div>
        <input
          type="number"
          id="min-viewport"
          min={0}
          bind:value={minViewportPx}
        />
        px
      </div>
    </div>

    <div class={styles.input}>
      <label for="max-viewport">Max viewport</label>
      <div>
        <input
          type="number"
          id="max-viewport"
          min={0}
          bind:value={maxViewportPx}
        />
        px
      </div>
    </div>
    <hr />
  </form>

  {#if hasError}
    <div class={styles.errors}>
      <strong>Oh no, there are errors </strong>
      <ul>
        {#if minValue > maxValue}
          <li>Min value must be less than max value</li>
        {/if}
        {#if hasNegative}
          <li>
            Please make sure all the viewport values are positive numbers and
            the max viewport is greater than 0
          </li>
        {/if}
      </ul>
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

  {#if !hasError}
    <div class={styles.box} />
  {/if}
</div>

<SvelteToast />
