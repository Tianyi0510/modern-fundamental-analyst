function rgba(value: string) {
  const srgb = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/);
  if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, Number(srgb[4] ?? 1)];
  if (!/^rgba?\(/.test(value)) throw new Error(`Unsupported computed color: ${value}`);
  const components = value.match(/[\d.]+/g)?.map(Number);
  if (!components || (components.length !== 3 && components.length !== 4)) {
    throw new Error(`Invalid computed color: ${value}`);
  }
  return [...components.slice(0, 3), components[3] ?? 1];
}

// Composite translucent text before applying WCAG's sRGB luminance formula.
export function colorContrast(foreground: string, background: string, opacity = 1) {
  const front = rgba(foreground);
  const back = rgba(background);
  if (back[3] !== 1) throw new Error("Contrast checks require an opaque background");
  const alpha = front[3]! * opacity;
  const visible = front.slice(0, 3).map((channel, index) => channel * alpha + back[index]! * (1 - alpha));
  const luminance = (channels: number[]) =>
    channels.slice(0, 3).reduce((sum, channel, index) => {
      const value = channel / 255;
      const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      return sum + linear * [0.2126, 0.7152, 0.0722][index]!;
    }, 0);
  const a = luminance(visible);
  const b = luminance(back);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
