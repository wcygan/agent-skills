import { CollectionItem } from "../../shared/collections";

export const demoItems: readonly CollectionItem[] = [
  CollectionItem.make({
    version: 1,
    id: "item-1",
    title: "Collection item 1",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    owner: "Lorem Ipsum",
    status: "Active",
    category: "Category 1",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    details:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    highlights: [
      "Lorem ipsum dolor sit amet",
      "Consectetur adipiscing elit",
      "Sed do eiusmod tempor incididunt",
    ],
  }),
  CollectionItem.make({
    version: 1,
    id: "item-2",
    title: "Collection item 2",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    owner: "Lorem Ipsum",
    status: "Draft",
    category: "Category 2",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    details:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    highlights: [
      "Lorem ipsum dolor sit amet",
      "Consectetur adipiscing elit",
      "Sed do eiusmod tempor incididunt",
    ],
  }),
  CollectionItem.make({
    version: 1,
    id: "item-3",
    title: "Collection item 3",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    owner: "Lorem Ipsum",
    status: "Archived",
    category: "Category 3",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    details:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    highlights: [
      "Lorem ipsum dolor sit amet",
      "Consectetur adipiscing elit",
      "Sed do eiusmod tempor incididunt",
    ],
  }),
];
