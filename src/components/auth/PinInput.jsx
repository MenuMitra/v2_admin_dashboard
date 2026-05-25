import React, { useCallback, useRef, useEffect } from "react";

/**
 * Secure PIN input with individual digit boxes, paste support, and show/hide toggle.
 */
export default function PinInput({
  length = 4,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
  showToggle = true,
  label = "PIN",
  id = "pin-input",
}) {
  const inputsRef = useRef([]);
  const [visible, setVisible] = React.useState(false);

  const digits = value.padEnd(length, "").slice(0, length).split("");
  while (digits.length < length) digits.push("");

  const focusIndex = useCallback((index) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    if (autoFocus && !disabled) {
      focusIndex(0);
    }
  }, [autoFocus, disabled, focusIndex]);

  const updateDigits = (newDigits) => {
    const pin = newDigits.join("").slice(0, length);
    onChange(pin);
    if (pin.length === length && onComplete) {
      onComplete(pin);
    }
  };

  const handleChange = (index, char) => {
    if (!/^\d?$/.test(char)) return;
    const next = [...digits];
    next[index] = char;
    updateDigits(next);
    if (char && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        updateDigits(next);
      } else if (index > 0) {
        focusIndex(index - 1);
        const next = [...digits];
        next[index - 1] = "";
        updateDigits(next);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    const next = pasted.split("");
    while (next.length < length) next.push("");
    updateDigits(next);
    focusIndex(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="w-full">
      {label ? (
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor={`${id}-0`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            {label}
            <span className="text-error-500">*</span>
          </label>
          {showToggle ? (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
              tabIndex={-1}
              aria-label={visible ? "Hide PIN" : "Show PIN"}
            >
              <i
                className={`fa-solid ${visible ? "fa-eye-slash" : "fa-eye"} mr-1`}
                aria-hidden
              />
              {visible ? "Hide" : "Show"}
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        className="flex gap-2 sm:gap-3"
        role="group"
        aria-label={label || "PIN"}
        onPaste={handlePaste}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            id={`${id}-${index}`}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type={visible ? "text" : "password"}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            disabled={disabled}
            value={digits[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={(e) => e.target.select()}
            className={`pin-digit h-12 w-full max-w-[3.25rem] rounded-xl border-2 bg-white/80 px-0 py-2.5 text-center text-xl font-semibold shadow-sm backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-900/80 dark:text-white ${
              error
                ? "border-error-500 text-error-600"
                : "border-gray-200 text-gray-800 dark:border-gray-600"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            aria-invalid={error}
          />
        ))}
      </div>
    </div>
  );
}
