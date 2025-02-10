export type BibleVerse = {
  text: string;
  reference: string;
  version?: string;
  book?: string;
  chapter?: string;
  verse?: string;
};

export type BibleVerseDisplayProps = {
  verses: BibleVerse[];
  currentVerse: BibleVerse;
};
