import data from './placeholder-images.json';
import type { Book } from './types';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export const featuredBooks: Book[] = [
    {
        id: 101,
        title: "The Palace of Illusions",
        author: "Chitra Banerjee Divakaruni",
        description: "A reimagining of the world-famous Indian epic, the Mahabharat—told from the point of view of an amazing woman.",
        imageUrl: "https://picsum.photos/seed/101/600/800",
        averageRating: 4.3,
        pageCount: 360,
        publisher: "Anchor",
        language: "en"
    },
    {
        id: 102,
        title: "Project Hail Mary",
        author: "Andy Weir",
        description: "A lone astronaut must save the earth from disaster in this incredible new science-based thriller from the #1 New York Times bestselling author of The Martian.",
        imageUrl: "https://picsum.photos/seed/102/600/800",
        averageRating: 4.5,
        pageCount: 496,
        publisher: "Ballantine Books",
        language: "en"
    },
    {
        id: 103,
        title: "Klara and the Sun",
        author: "Kazuo Ishiguro",
        description: "A magnificent new novel from the Nobel laureate Kazuo Ishiguro—author of Never Let Me Go and the Booker Prize-winning The Remains of the Day.",
        imageUrl: "https://picsum.photos/seed/103/600/800",
        averageRating: 4.1,
        pageCount: 303,
        publisher: "Knopf",
        language: "en"
    },
    {
        id: 104,
        title: "The Midnight Library",
        author: "Matt Haig",
        description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
        imageUrl: "https://picsum.photos/seed/104/600/800",
        averageRating: 4.2,
        pageCount: 304,
        publisher: "Viking",
        language: "en"
    },
    {
        id: 105,
        title: "The Vanishing Half",
        author: "Brit Bennett",
        description: "A stunning new novel about twin sisters, inseparable as children, who ultimately choose to live in two very different worlds, one black and one white.",
        imageUrl: "https://picsum.photos/seed/105/600/800",
        averageRating: 4.4,
        pageCount: 352,
        publisher: "Riverhead Books",
        language: "en"
    },
    {
        id: 106,
        title: "Crying in H Mart",
        author: "Michelle Zauner",
        description: "A powerful and poignant memoir about growing up Korean American, losing her mother, and forging her own identity.",
        imageUrl: "https://picsum.photos/seed/106/600/800",
        averageRating: 4.3,
        pageCount: 256,
        publisher: "Knopf",
        language: "en"
    }
];
