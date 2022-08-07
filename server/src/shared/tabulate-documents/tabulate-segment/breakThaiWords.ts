const thaiMemo = new Map<string, string[]>();
export const breakThaiWords = async (text: string): Promise<string[]> => {
  if (thaiMemo.get(text)) {
    return thaiMemo.get(text) as string[];
  }
  const allKeys = Array.from(thaiMemo.keys());
  const foundKey = allKeys.find(key => key.includes(text));
  if (foundKey) {
    // If we find the key, then all we have to do is find our position in the key
    const position = foundKey.indexOf(text);
    const separatedWords = thaiMemo.get(foundKey) as string[];
    let letterIndex = 0;
    for (let i = 0; i < separatedWords.length; i++) {
      const currentWord = separatedWords[i];
      if (letterIndex === position) {
        // Now all we have to do is return the array sliced starting at this index
        const splitWords = separatedWords.slice(i);
        thaiMemo.set(text, splitWords);
        return splitWords;
      }
      letterIndex += currentWord.length;
    }
    if (letterIndex === position) {
      // Now all we have to do is return the array sliced starting at this index
      const splitWords = separatedWords.slice(separatedWords.length - 1);
      thaiMemo.set(text, splitWords);
      return splitWords;
    }
  }
  const result = await fetch(
    `${process.env.PUBLIC_URL}/api/thai/separate`,
    {
      method: "POST",
      body: JSON.stringify({text}),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const json = await result.json();
  thaiMemo.set(text, json);
  return thaiMemo.get(text) as string[];
};