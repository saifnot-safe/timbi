export function titleCase(text: string | null | undefined) {
  if (!text) return "";

  return text
    .split(" ")
    .map((word) => {
      if (word === word.toUpperCase() && word.length > 1) {
        return word;
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
      );
    })
    .join(" ");
}