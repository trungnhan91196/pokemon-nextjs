// Function to convert image URL to Base64
export const toBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
  });
};

export function getID(url: string) {
  const regex = /\/([^\/]+)\/?$/;
  const match = url.match(regex);
  if (match) {
    return match[1];
  }
}
