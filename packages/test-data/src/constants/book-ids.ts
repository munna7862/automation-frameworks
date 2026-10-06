/**
 * Known book IDs present in the seeded BuggyBooks catalog database.
 * The catalog contains 15 initial books.
 */
export const KNOWN_BOOK_IDS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15'
] as const;

export type KnownBookId = (typeof KNOWN_BOOK_IDS)[number];

export const CATALOG_BOOK_MAP: Record<KnownBookId, { title: string; defaultPrice: number }> = {
  '1': { title: 'The Great Gatsby', defaultPrice: 10.99 },
  '2': { title: 'To Kill a Mockingbird', defaultPrice: 12.99 },
  '3': { title: '1984', defaultPrice: 9.99 },
  '4': { title: 'Pride and Prejudice', defaultPrice: 8.99 },
  '5': { title: 'The Catcher in the Rye', defaultPrice: 11.99 },
  '6': { title: 'The Hobbit', defaultPrice: 14.99 },
  '7': { title: 'Fahrenheit 451', defaultPrice: 10.5 },
  '8': { title: 'Jane Eyre', defaultPrice: 9.5 },
  '9': { title: 'Animal Farm', defaultPrice: 7.99 },
  '10': { title: 'Brave New World', defaultPrice: 13.99 },
  '11': { title: 'Wuthering Heights', defaultPrice: 8.5 },
  '12': { title: 'The Odyssey', defaultPrice: 15.99 },
  '13': { title: 'Crime and Punishment', defaultPrice: 14.5 },
  '14': { title: 'The Picture of Dorian Gray', defaultPrice: 11.5 },
  '15': { title: 'Frankenstein', defaultPrice: 10.0 }
};
