function relativeLuminance(r, g, b) {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const sR = r <= 0.03928 ? r1 / 12.92 : Math.pow((r1 + 0.055) / 1.055, 2.4);
  const sG = g <= 0.03928 ? g1 / 12.92 : Math.pow((g1 + 0.055) / 1.055, 2.4);
  const sB = b <= 0.03928 ? b1 / 12.92 : Math.pow((b1 + 0.055) / 1.055, 2.4);
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

function luminance(a, b) {
  const l1 = Math.max(a, b);
  const l2 = Math.min(a, b);
  return (l1 + 0.05) / (l2 + 0.05);
}

function contrastRatio(fg, bg) {
  if (fg[0] === bg[0] && fg[1] && bg[1] && fg[2] === bg[2]) {
    return 1;
  }
  return luminance(relativeLuminance(...fg), relativeLuminance(...bg));
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [];
}

function newShade(hexColor, magnitude) {
  hexColor = hexColor.replace(`#`, ``);
  if (hexColor.length === 6) {
      const decimalColor = parseInt(hexColor, 16);
      let r = (decimalColor >> 16) + magnitude;
      r > 255 && (r = 255);
      r < 0 && (r = 0);
      let g = (decimalColor & 0x0000ff) + magnitude;
      g > 255 && (g = 255);
      g < 0 && (g = 0);
      let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
      b > 255 && (b = 255);
      b < 0 && (b = 0);
      return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
  } else {
      return hexColor;
  }
};

export default function getUsernameColor(hexColor) {
  const messageRgbColor = hexToRgb(hexColor);
  const backgroundRgbColor = hexToRgb('#000000');
  try {
    const ratio = contrastRatio(messageRgbColor, backgroundRgbColor);
    return ratio >= 4.5 ? hexColor : newShade(hexColor, 100);
  } catch (e) {
    return hexColor;
  }
}
