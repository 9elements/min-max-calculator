<script>
  import { fly } from "svelte/transition"
  import { cubicInOut } from "svelte/easing"
  import CheckIcon from "../Icons/Check.svelte"
  import styles from "./Calculator.module.css"
  import { onMount } from "svelte"

  /** @type {"px" | "rem"} */
  let unit = $state("px")
  const urlState = globalThis.window?.location.search.match(
    /\?(\d+)-(\d+),(\d+)-(\d+)/
  )

  const toRem = (value) => +(value / 16)?.toFixed(3)
  const toPx = (value) => +(value * 16)?.toFixed(3)

  let minValue = $state(+urlState?.[1] || 16)
  let maxValue = $state(+urlState?.[2] || 24)
  let minViewport = $state(+urlState?.[3] || 320)
  let maxViewport = $state(+urlState?.[4] || 1200)
  const variablePart = $derived(
    (maxValue - minValue) / (maxViewport - minViewport)
  )
  const constant = $derived(
    parseFloat(((maxValue - maxViewport * variablePart) / 16).toFixed(3))
  )

  // prettier-ignore
  const result = $derived(`clamp(${toRem(minValue)}rem,${constant ? ` ${constant}rem +` : ""} ${parseFloat((100 * variablePart).toFixed(2))}vw, ${toRem(maxValue)}rem)`)

  // Errors
  let hasError = $state(false)
  const hasNegative = $derived(minViewport < 0 || maxViewport < 1)
  const isMinValueGreaterThanMax = $derived(minValue >= maxValue)
  const isMinViewportGreaterThanMax = $derived(minViewport >= maxViewport)

  let isCopied = $state(false)

  // Functions
  const switchUnit = () => {
    unit = unit === "px" ? "rem" : "px"
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
    hasError =
      hasNegative || isMinValueGreaterThanMax || isMinViewportGreaterThanMax
  }

  $effect(() => {
    globalThis.window?.history.replaceState(
      {},
      null,
      `?${minValue}-${maxValue},${minViewport}-${maxViewport}`
    )
  })

  onMount(() => {
    validate()
  })
</script>

<section class={styles.wrapper}>
  <form onsubmit={(e) => e.preventDefault()} class={styles.form}>
    <fieldset class={styles.fieldset} aria-label="Minimum and maximum Values">
      <div class={styles.fieldsetHeader}>
        <span class={styles.legend} aria-hidden="true">Values</span>

        <fieldset class={styles.unitToggle} aria-label="Switch unit">
          <label
            for="unit-px"
            class={styles.unitLabel}
            data-active={unit === "px"}
          >
            <span class="sr-only">Pixel</span>
            <span aria-hidden="true">px</span>
          </label>
          <input
            type="radio"
            id="unit-px"
            name="unit"
            onchange={switchUnit}
            checked
            class={styles.unitRadio}
          />

          <label
            for="unit-rem"
            class={styles.unitLabel}
            data-active={unit === "rem"}
          >
            rem
          </label>
          <input
            type="radio"
            id="unit-rem"
            name="unit"
            onchange={switchUnit}
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
              aria-describedby="min-value-description"
              onblur={validate}
              value={unit === "px" ? minValue : toRem(minValue)}
              onchange={(e) => {
                const value = e.target.value
                minValue = unit === "rem" ? toPx(value) : value
              }}
            />
            <!-- bind:value={minValue} -->
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
              value={unit === "px" ? maxValue : toRem(maxValue)}
              onchange={(e) => {
                const value = e.target.value
                maxValue = unit === "rem" ? toPx(value) : value
              }}
              onblur={validate}
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
              bind:value={minViewport}
              onblur={validate}
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
              bind:value={maxViewport}
              onblur={validate}
            />
            <span class={styles.inputUnit}>px</span>
          </div>
        </div>
      </div>
    </fieldset>
  </form>

  <!-- This makes errors appear only on blur, but makes them disappear instantly when the user fixes them -->
  {#if hasError && (hasNegative || isMinValueGreaterThanMax || isMinViewportGreaterThanMax)}
    <div class={styles.errors}>
      <strong>Oh no, there are errors: </strong>
      <ul>
        {#if isMinValueGreaterThanMax}
          <li>Min value must be less than max value</li>
        {/if}
        {#if hasNegative}
          <li>
            Please make sure all the viewport values are positive numbers and
            the max viewport is greater than 0
          </li>
        {/if}
        {#if isMinViewportGreaterThanMax}
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
        onclick={copyToClipboard}
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
