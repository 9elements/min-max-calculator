<script>
  import { fly } from "svelte/transition"
  import { cubicInOut } from "svelte/easing"
  import CheckIcon from "../Icons/Check.svelte"
  import styles from "./Calculator.module.css"

  let unit = "px" // or "rem"
  $: isRem = unit === "rem"
  const toRem = (value) => +(isRem ? value : value / 16)?.toFixed(3)
  const toPx = (value) => +(isRem ? value * 16 : value)?.toFixed(3)
  const switchToCurrentValue = (value) => (isRem ? toRem(value) : toPx(value))

  let minValue = 16
  let maxValue = 24
  let minViewportPx = 320
  let maxViewportPx = 1200
  $: minViewport = switchToCurrentValue(minViewportPx)
  $: maxViewport = switchToCurrentValue(maxViewportPx)

  // Errors
  let hasError = false
  let hasNegative = false
  let isMinValueGreaterThanMaxValue = false
  let isMinViewPortGreaterThanMaxViewPort = false

  let result
  let isCopied = false

  // Functions

  const switchUnit = () => {
    const switchValue = (value) => (isRem ? toPx(value) : toRem(value))
    unit = unit === "px" ? "rem" : "px"

    minValue = switchValue(minValue)
    maxValue = switchValue(maxValue)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result).then(() => {
      isCopied = true
      setTimeout(() => {
        isCopied = false
      }, 2000)
    })
  }

  const validate = () => {
    hasNegative = minViewportPx < 0 || maxViewportPx < 1
    isMinValueGreaterThanMaxValue = minValue >= maxValue
    isMinViewPortGreaterThanMaxViewPort = minViewportPx >= maxViewportPx
    hasError =
      hasNegative ||
      isMinValueGreaterThanMaxValue ||
      isMinViewPortGreaterThanMaxViewPort
  }

  $: {
    // Write Result
    const minValuePx = isRem ? toPx(minValue) : minValue
    const maxValuePx = isRem ? toPx(maxValue) : maxValue
    const variablePart = (maxValuePx - minValuePx) / (maxViewport - minViewport)
    const constant = parseFloat(
      ((maxValuePx - maxViewport * variablePart) / 16).toFixed(3)
    )
    // prettier-ignore
    result = `clamp(${toRem(minValue)}rem,${constant ? ` ${constant}rem +` : ""} ${parseFloat((100 * variablePart).toFixed(2))}vw, ${toRem(maxValue)}rem)`
  }
</script>

<section class={styles.wrapper}>
  <form on:submit|preventDefault class={styles.form}>
    <fieldset class={styles.fieldset} aria-label="Minimum and maximum Values">
      <div class={styles.fieldsetHeader}>
        <span class={styles.legend} aria-hidden="true">Values</span>

        <fieldset class={styles.unitToggle} aria-label="Switch unit">
          <label for="unit-px" class={styles.unitLabel} data-active={!isRem}>
            <span class="sr-only">Pixel</span>
            <span aria-hidden="true">px</span>
          </label>
          <input
            type="radio"
            id="unit-px"
            name="unit"
            on:change={switchUnit}
            checked
            class={styles.unitRadio}
          />

          <label for="unit-rem" class={styles.unitLabel} data-active={isRem}>
            rem
          </label>
          <input
            type="radio"
            id="unit-rem"
            name="unit"
            on:change={switchUnit}
            class={styles.unitRadio}
          />
          <span
            class={styles.unitToggleIndicator}
            data-unit={unit}
            aria-hidden="true"
          ></span>
        </fieldset>
      </div>

      <div class={styles.inputRow}>
        <div class={styles.inputWrapper}>
          <div class={styles.inputInner}>
            <label
              class={styles.inputLabel}
              for="min-value"
              aria-label="Minimum Value">Min</label
            >
            <input
              class={styles.input}
              type="number"
              step="any"
              id="min-value"
              bind:value={minValue}
              aria-describedby="min-value-description"
              on:blur={validate}
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
            <label
              class={styles.inputLabel}
              for="max-value"
              aria-label="Maximum Value">Max</label
            >
            <input
              class={styles.input}
              type="number"
              step="any"
              min={0}
              id="max-value"
              bind:value={maxValue}
              on:blur={validate}
            />
            <span class={styles.inputUnit}>
              {unit}
            </span>
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset class={styles.fieldset} aria-label="Viewport range">
      <span aria-hidden="true" class={styles.legend}>Viewport</span>
      <div class={styles.inputRow}>
        <div class={styles.inputWrapper}>
          <div class={styles.inputInner}>
            <label
              class={styles.inputLabel}
              for="min-viewport"
              aria-label="Minimum viewport">Min</label
            >
            <input
              class={styles.input}
              type="number"
              step="any"
              id="min-viewport"
              min={0}
              bind:value={minViewportPx}
              on:blur={validate}
            />
            <span class={styles.inputUnit}>px</span>
          </div>
        </div>

        <div class={styles.inputWrapper}>
          <div class={styles.inputInner}>
            <label
              class={styles.inputLabel}
              for="max-viewport"
              aria-label="Maximum Viewport">Max</label
            >
            <input
              class={styles.input}
              type="number"
              step="any"
              id="max-viewport"
              min={0}
              bind:value={maxViewportPx}
              on:blur={validate}
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
        {#if isMinValueGreaterThanMaxValue}
          <li>Min value must be less than max value</li>
        {/if}
        {#if hasNegative}
          <li>
            Please make sure all the viewport values are positive numbers and
            the max viewport is greater than 0
          </li>
        {/if}
        {#if isMinViewPortGreaterThanMaxViewPort}
          <li>Min viewport must be less than max viewport</li>
        {/if}
      </ul>
    </div>
  {/if}

  <div class={styles.output}>
    <h2 class="sr-only">Calculated Result:</h2>
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

<details-utils animate>
  <details class={styles.liveExample} style="--variable-value: {result}">
    <summary>Live font-size example</summary>
    <div>
      <p style="font-size:var(--variable-value)" contenteditable="true">
        This text uses the calculated clamp formula. It gets invisible when you
        use 0 or negative numbers as a min-value. 🥲 Try editing it, though...
      </p>
    </div>
  </details>
</details-utils>
