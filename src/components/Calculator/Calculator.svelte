<script>
  import { fly } from "svelte/transition"
  import { cubicInOut } from "svelte/easing"
  import CheckIcon from "../Icons/Check.svelte"
  import styles from "./Calculator.module.css"

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
  let isCopied = false

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
    navigator.clipboard.writeText(result).then(() => {
      isCopied = true
      setTimeout(() => {
        isCopied = false
      }, 2000)
    })
  }

  $: {
    // Write Result
    const variablePart = (maxValue - minValue) / (maxViewport - minViewport)
    const constant = toRem(+(maxValue - maxViewport * variablePart))
    // prettier-ignore
    result = `clamp(${toRem(minValue)}rem, calc(${constant}rem + ${+(100 * variablePart).toFixed(2)}vw), ${toRem(maxValue)}rem)`
  }
</script>

<section class={styles.wrapper}>
  <form on:submit|preventDefault class={styles.form}>
    <fieldset class={styles.fieldset}>
      <legend class="sr-only"> Values </legend>
      <div class={styles.fieldsetHeader}>
        <span class={styles.legend} aria-hidden="true">Values</span>

        <fieldset class={styles.unitToggle}>
          <legend class="sr-only">Switch unit</legend>
          <label
            for="unit-px"
            class={styles.unitLabel}
            data-active={!isRem}
            aria-label="Pixel"
          >
            px
            <input
              type="radio"
              id="unit-px"
              name="unit"
              on:change={switchUnit}
              checked
              class={styles.unitRadio}
            />
          </label>

          <label for="unit-rem" class={styles.unitLabel} data-active={isRem}>
            rem
            <input
              type="radio"
              id="unit-rem"
              name="unit"
              on:change={switchUnit}
              class={styles.unitRadio}
            />
          </label>
          <span
            class={styles.unitToggleIndicator}
            data-unit={unit}
            aria-hidden="true"
          />
        </fieldset>
      </div>

      <div class={styles.inputRow}>
        <div class={styles.inputWrapper}>
          <div class={styles.inputInner}>
            <label class={styles.inputLabel} for="min-value"> Min </label>
            <input
              class={styles.input}
              type="number"
              id="min-value"
              bind:value={minValue}
              aria-describedby="min-value-description"
            />
            <span class={styles.inputUnit}>
              {unit}
            </span>
          </div>
          <small class={styles.inputDescription} id="min-value-description">
            can be negative, e.g. for margins or absolute positioning
          </small>
        </div>
        <div class={styles.inputWrapper}>
          <div class={styles.inputInner}>
            <label class={styles.inputLabel} for="max-value">Max</label>
            <input
              class={styles.input}
              type="number"
              id="max-value"
              bind:value={maxValue}
            />
            <span class={styles.inputUnit}>
              {unit}
            </span>
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset class={styles.fieldset}>
      <legend class="sr-only"> Viewport </legend>
      <span aria-hidden="true" class={styles.legend}> Viewport </span>
      <div class={styles.inputRow}>
        <div class={styles.inputWrapper}>
          <div class={styles.inputInner}>
            <label class={styles.inputLabel} for="min-viewport">Min</label>
            <input
              class={styles.input}
              type="number"
              id="min-viewport"
              min={0}
              bind:value={minViewportPx}
            />
            <span class={styles.inputUnit}>px</span>
          </div>
        </div>

        <div class={styles.inputWrapper}>
          <div class={styles.inputInner}>
            <label class={styles.inputLabel} for="max-viewport">Max</label>
            <input
              class={styles.input}
              type="number"
              id="max-viewport"
              min={0}
              bind:value={maxViewportPx}
            />
            <span class={styles.inputUnit}>px</span>
          </div>
        </div>
      </div>
    </fieldset>
  </form>

  {#if hasError}
    <div class={styles.errors}>
      <strong>Oh no, there are errors: </strong>
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
  {/if}

  <div class={styles.output}>
    <code class={styles.outputCSS}>
      {result}
    </code>
    <div class={styles.copyButtonWrapper}>
      <button
        class={styles.copyButton}
        data-copied={isCopied}
        on:click={copyToClipboard}
      >
        <span class={styles.copyButtonTextPlaceholder} aria-hidden="true">
          copy
        </span>
        {#if !isCopied}
          <span
            in:fly={{
              x: -10,
              opacity: 0,
              duration: 600,
              delay: 50,
              easing: cubicInOut,
            }}
            out:fly={{ x: 10, opacity: 0, duration: 600, easing: cubicInOut }}
            class={styles.copyButtonText}
          >
            copy
          </span>
        {/if}
        <span class="sr-only">snippet to clipboard</span>
      </button>

      {#if isCopied}
        <p
          in:fly={{
            x: -20,
            opacity: 0,
            duration: 600,
            easing: cubicInOut,
            delay: 50,
          }}
          out:fly={{ x: 20, opacity: 0, duration: 600, easing: cubicInOut }}
          role="status"
          class={styles.copySuccess}
        >
          <CheckIcon />
          <span class="sr-only"> Copied to clipboard </span>
        </p>
      {/if}
    </div>
  </div>
</section>
