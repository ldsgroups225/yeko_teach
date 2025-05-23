// src/utils/ManipulateColor.ts

/**
 * Represents a color in various formats.
 */
type ColorInput =
  | string
  | [number, number, number]
  | [number, number, number, number]
  | {
    r: number
    g: number
    b: number
    a?: number
  }

/**
 * Options for color manipulation.
 */
interface ColorOptions {
  alpha?: number
  format?: 'hex' | 'rgb' | 'hsl'
  adjustments?: {
    lightness?: number
    saturation?: number
    hue?: number
  }
}

/**
 * Manipulates and converts a color based on specified options and opacity.
 *
 * @param color - The input color (hex string, RGB/RGBA array, or RGB/RGBA object).
 * @param opacity - The opacity to apply to the color (0 to 1). If provided, overrides the alpha in ColorOptions.
 * @param options - Options for color manipulation.
 * @returns The color in the specified format with applied adjustments and opacity.
 * @throws {Error} If the input color is invalid or any option is out of range.
 *
 * @example
 * // Returns "rgb(255 0 0 / 0.50)" (red with 50% opacity)
 * manipulateColor("#FF0000", 0.5);
 *
 * @example
 * // Returns "hsl(120deg 100% 50% / 0.75)" (green with 75% opacity in HSL)
 * manipulateColor([0, 255, 0], 0.75, { format: 'hsl' });
 *
 * @example
 * // Returns "rgb(128 0 255)" (blue-violet, lightened and hue-shifted)
 * manipulateColor({ r: 0, g: 0, b: 255 }, 1, {
 *   format: 'rgb',
 *   adjustments: { lightness: 0.25, hue: 60 }
 * });
 */
export function manipulateColor(
  color: ColorInput,
  opacity?: number,
  options: ColorOptions = {},
): string {
  const { alpha = 1, format = 'rgb', adjustments = {} } = options
  // Use provided opacity if available; otherwise, use alpha from options
  const finalAlpha = opacity !== undefined ? opacity : alpha

  if (finalAlpha < 0 || finalAlpha > 1) {
    throw new Error('Alpha/Opacity must be between 0 and 1')
  }

  // Convert input color to RGBA components
  let r: number
  let g: number
  let b: number
  let a: number = finalAlpha

  if (typeof color === 'string') {
    // Remove leading '#' and normalize hex string
    const hex = color.replace(/^#/, '')
    // Supports 3-digit, 6-digit, and optionally 8-digit (with alpha) hex colors
    if (!/^(?:[0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(hex)) {
      throw new Error('Invalid hexadecimal color string')
    }

    // Expand shorthand (3-digit) hex to full 6-digit
    const fullHex = hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex

    r = Number.parseInt(fullHex.slice(0, 2), 16)
    g = Number.parseInt(fullHex.slice(2, 4), 16)
    b = Number.parseInt(fullHex.slice(4, 6), 16)

    // If an 8-digit hex is provided and opacity was not explicitly passed, use the hex alpha
    if (fullHex.length === 8 && opacity === undefined) {
      a = Number.parseInt(fullHex.slice(6, 8), 16) / 255
    }
  }
  else if (Array.isArray(color)) {
    // Destructure the array; if alpha is missing, default to finalAlpha
    [r, g, b, a = finalAlpha] = color
  }
  else {
    // Destructure from object; if alpha is missing, default to finalAlpha
    ({ r, g, b, a = finalAlpha } = color)
  }

  // Clamp and round RGB values and clamp alpha
  r = clamp(Math.round(r), 0, 255)
  g = clamp(Math.round(g), 0, 255)
  b = clamp(Math.round(b), 0, 255)
  a = clamp(a, 0, 1)

  // Convert RGB to HSL for potential adjustments
  let [h, s, l] = rgbToHsl(r, g, b)

  // Apply adjustments if provided (checking explicitly for defined values)
  if (typeof adjustments.hue === 'number') {
    h = (h + adjustments.hue) % 360
    if (h < 0)
      h += 360 // Ensure positive hue
  }
  if (typeof adjustments.saturation === 'number') {
    s = clamp(s + adjustments.saturation, 0, 1)
  }
  if (typeof adjustments.lightness === 'number') {
    l = clamp(l + adjustments.lightness, 0, 1)
  }

  // Convert adjusted HSL back to RGB
  [r, g, b] = hslToRgb(h, s, l)

  // Format the final color output
  switch (format) {
    case 'hex':
      return rgbToHex(r, g, b, a)
    case 'rgb':
      return a < 1
        ? `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)} / ${a.toFixed(2)})`
        : `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`
    case 'hsl':
      return a < 1
        ? `hsl(${Math.round(h)}deg ${Math.round(s * 100)}% ${Math.round(l * 100)}% / ${a.toFixed(2)})`
        : `hsl(${Math.round(h)}deg ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`
    default:
      throw new Error('Invalid format specified')
  }
}

// --- Helper Functions ---

/**
 * Converts an RGB color value to HSL.
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns [hue (0-360), saturation (0-1), lightness (0-1)]
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h *= 60
  }

  return [h, s, l]
}

/**
 * Converts an HSL color value to RGB.
 * @param h - Hue (0-360)
 * @param s - Saturation (0-1)
 * @param l - Lightness (0-1)
 * @returns [red, green, blue] each in the range 0-255
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l // Achromatic
  }
  else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0)
        t += 1
      if (t > 1)
        t -= 1
      if (t < 1 / 6)
        return p + (q - p) * 6 * t
      if (t < 1 / 2)
        return q
      if (t < 2 / 3)
        return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const hk = h / 360
    r = hue2rgb(p, q, hk + 1 / 3)
    g = hue2rgb(p, q, hk)
    b = hue2rgb(p, q, hk - 1 / 3)
  }

  return [r * 255, g * 255, b * 255]
}

/**
 * Converts RGB(A) values to a hexadecimal string.
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param a - Alpha component (0-1)
 * @returns Hexadecimal color string (includes alpha if less than 1)
 */
function rgbToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (x: number): string =>
    Math.round(x).toString(16).padStart(2, '0')
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  return a < 1 ? hex + toHex(a * 255) : hex
}

/**
 * Clamps a number between a minimum and maximum value.
 * @param value - The number to clamp.
 * @param min - Minimum allowed value.
 * @param max - Maximum allowed value.
 * @returns The clamped value.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
