export type BibleVerse = {
  text: string;
  reference: string;
};

export type BibleVerseDisplayProps = {
  verses: BibleVerse[];
  currentBook: string;
};
