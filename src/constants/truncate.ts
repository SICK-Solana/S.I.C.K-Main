export default function truncate(text: string, maxLength: number, suffix = "...") {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + suffix;
    }
    return text;
  }
  