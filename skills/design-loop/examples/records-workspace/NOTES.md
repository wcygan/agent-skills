# Records workspace

A standalone demo of one task: find a work item and move it forward. Open
`index.html` directly; it needs no build, external assets, account, or network.
The neutral typography, surfaces, borders, spacing, and small accent follow the
settings example, but this file has independent navigation, data, and storage.

## Inspected inspiration (2026-10-03)

- [Linear search](https://linear.app/docs/search): view-scoped search filters
  matching issues as the user types.
- [Linear filters](https://linear.app/docs/filters): narrow the current issue list
  to matching records.
- [Ramp bulk editing](https://support.ramp.com/bulk-editing-accounting-tools/):
  selecting multiple records to apply one action.

The table, detail drawer, sample records, and exact styling are adaptations for
this example, not replicas or claims about either product's complete UI.

## Interaction contract

- All work shows active items; Assigned to me means Maya Chen in this fictional
  dataset; Archived offers restoration. Navigation resets search, filters, and selection.
- Search covers title, ID, and owner. Status filters combine with the search.
- Titles open a keyboard-accessible detail drawer with status and owner editing.
  Escape and Close return focus to the originating item, or search if it disappeared.
- Row menus expose details, completion, and archive/restore. Checkboxes are separate
  controls; clicking descriptive text does not select a record.
- Bulk selection applies only to visible items. Search/filter changes clear selection
  so hidden items are never unexpectedly changed. Select all exposes its mixed state.
- Bulk completion and archive/restore act on selected items. Undo reverses the most
  recent change in this session. Archive is reversible; no deletion is offered.
- Changes persist only in localStorage, under `design-loop:records-workspace:v1`.
  Storage errors preserve the in-memory candidate and expose Retry saving.
- Narrow screens omit owner from the table; the detail drawer retains it. Titles,
  status, selection, and actions remain available. The drawer becomes full width.

## Review modes

- `?view=wireframe`: neutral structural presentation using the same task and controls.
- `?state=error`: the first persistence attempt fails; Retry saving recovers.
- A search that matches nothing shows an actionable empty result with Clear filters.
- Archive all active items to inspect the empty workspace; Undo restores them.

There is no loading spinner: the dataset is synchronous and local. Real services
need loading, server errors, concurrency, pagination, permissions, and durable undo
appropriate to their data model. This demo does not establish usability with real users.

## Shared shell geometry

Both demos use a 1280px maximum shell, 32px desktop inset, 180px sidebar,
64px column gap, and 64px top offset. Settings constrains its content to 640px
inside that shell; records uses the remaining width. At 760px and below, both
use a 20px inset, 28px top offset, and navigation above the content. Keep these
values and navigation row metrics aligned when adapting the examples.
