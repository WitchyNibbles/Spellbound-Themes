# VS Code product icon inventory for WitchyNibbles

Built against VS Code **1.141.0** (commit `2a59476c9bfcb90b3ddc372c36762471b7dfad1c`), the local Windows install. The registered icon list was taken from `workbench.desktop.main.js` (every `registerIcon` call: 399 unique workbench IDs) and the codicon table in the same bundle (785 codicon IDs, including aliases). Nothing in the repo was modified.

How to read the tables:

- **ID**: the exact key to use in `iconDefinitions`.
- **Kind / default**:
  - *registered, default `x`*: a workbench icon whose default is a reference to codicon `x`. It inherits a mapping for `x` (see the rule below).
  - *codicon*: a plain codicon. It has a concrete glyph default and inherits nothing.
  - *codicon alias, same glyph as `x` (no inheritance)*: registered with `register('id', 'x')` in codicons.ts. This copies the font character only. Mapping `x` does **not** change it.
- **Current theme**: **mapped** means the key is one of the 48 in `icons/product-icon-map.json`. *themed via `x`* means the key is unmapped but inherits the WitchyNibbles glyph through its default chain. Blank means it shows the stock codicon today.

Of the 132 core-tier IDs, 30 are mapped directly, 16 are themed through inheritance, and **86 still show stock codicons**.

## Fallback and resolution rule (confirmed in source)

`ProductIconThemeData.getIcon` calls `_resolveIconDefinition(iconContribution, iconThemeDocument)` in `src/vs/workbench/services/themes/browser/productIconThemeData.ts`. The bundled 1.141 code is function `iIr`:

```js
function iIr(s,o){let e=o.iconDefinitions,t=e.get(s.id),i=s.defaults;
  for(;!t&&Q.isThemeIcon(i);){let n=tIr.getIcon(i.id);if(n)t=e.get(n.id),i=n.defaults;else return}
  if(t)return t;if(!Q.isThemeIcon(i))return i}
```

1. **The ID's own key wins.** If the theme defines `explorer-view-icon`, that glyph is used, whatever `files` maps to.
2. **Otherwise the default chain is walked.** An unmapped registered icon whose default is a ThemeIcon reference (`explorer-view-icon` -> `files`) uses the theme's definition for `files`, if there is one. The walk continues through multi-step chains such as `folding-manual-collapsed` -> `folding-collapsed` -> `chevron-right`. **So if `explorer-view-icon` is unmapped and `files` is mapped, the themed `files` glyph is shown.**
3. **Otherwise the stock codicon is used.** If nothing in the chain is mapped, the resolver returns the final concrete default, which is the built-in codicon font character.
4. **Aliases do not inherit.** Codicons are registered at startup by `initialize()` in `src/vs/platform/theme/common/iconRegistry.ts` (bundle: `QZn()` -> `registerIcon(id,{fontCharacter})`). Every codicon, including aliases like `tree-item-expanded`, `toolbar-more`, `dialog-error` and `menu-submenu`, therefore gets a concrete fontCharacter default and no ThemeIcon link. `fe(s,o)` in the bundle (`register()` in `src/vs/base/common/codiconsUtil.ts`) copies the character of the target ID. Mapping `chevron-down` does not change tree twisties, and mapping `ellipsis` or `more` does not change the `...` toolbar overflow.
5. **First registration wins.** `registerIcon` returns early when an ID is already registered. For a workbench ID that equals a codicon name (`debug-stop`, `debug-breakpoint`, `debug-start`, ...), the codicon registration comes first, so these IDs behave as plain codicons.
6. **The CSS covers every registered icon.** `getCSS()` in `src/vs/platform/theme/browser/iconsStyleSheet.ts` loops over `iconRegistry.getIcons()` and emits `.codicon-<id>:before` plus `--vscode-icon-<id>-content` / `-font-family` variables. Some workbench CSS consumes the variables directly. Examples: the dirty-tab dot uses `circle-filled`, the sticky dirty tab uses `pinned-dirty`, and the compact menu bar uses `menu`.

What the docs say. The product icon theme guide says themes "can replace each icon individually, as well as all icons from the codicon library". The icon reference says "the default codicon ID describes which icon from the codicon library is used by default". Neither page spells out rule 4 (aliases do not inherit). The published reference table also omits some IDs that 1.141 registers, for example `activity-bar-left`.

## Summary counts

| Group | Core tier | Extended tier |
|---|---|---|
| Activity Bar and side bar containers | 12 | 1 |
| View title actions (Explorer, Search, SCM, Run, Extensions) | 11 | 19 |
| Tree/list chrome | 1 | 5 |
| Editor chrome (tabs, title, breadcrumbs, gutter) | 14 | 9 |
| Find widget (editor and Search view) | 10 | 1 |
| Panel (Problems, Output, Debug Console, Terminal, Ports) | 14 | 10 |
| Status bar | 11 | 6 |
| Notifications, dialogs, quick input, title bar | 9 | 10 |
| Layout controls (title bar) | 7 | 0 |
| Debug toolbar, breakpoints, Run and Debug views | 14 | 10 |
| Testing | 4 | 12 |
| Symbols (Outline, breadcrumbs, suggest widget, Go to Symbol) | 17 | 6 |
| Diff editor and SCM | 8 | 8 |
| **Total** | **132** | **97** |

## Core tier: visible in a normal session

### Activity Bar and side bar containers (12)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `explorer-view-icon` | registered, default `files` | **mapped** | Activity Bar: Explorer |
| `search-view-icon` | registered, default `search-large` | **mapped** | Activity Bar: Search |
| `source-control-view-icon` | registered, default `source-control` | **mapped** | Activity Bar: Source Control |
| `run-view-icon` | registered, default `debug-alt` | themed via `debug-alt` | Activity Bar: Run and Debug |
| `extensions-view-icon` | registered, default `extensions` | **mapped** | Activity Bar: Extensions |
| `test-view-icon` | registered, default `beaker` |  | Activity Bar: Testing (when a test provider is active) |
| `remote-explorer-view-icon` | registered, default `remote-explorer` |  | Activity Bar: Remote Explorer (Remote/WSL extensions installed) |
| `chat-view-icon` | registered, default `chat-sparkle` |  | Chat / Copilot view container (secondary side bar tab) |
| `accounts-view-bar-icon` | registered, default `account` | themed via `account` | Activity Bar bottom: Accounts |
| `settings-view-bar-icon` | registered, default `settings-gear` | themed via `settings-gear` | Activity Bar bottom: Manage gear |
| `view-pane-container-expanded` | registered, default `chevron-down` |  | Side bar section header chevron (expanded) |
| `view-pane-container-collapsed` | registered, default `chevron-right` |  | Side bar section header chevron (collapsed) |

### View title actions (Explorer, Search, SCM, Run, Extensions) (11)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `new-file` | codicon |  | Explorer: New File |
| `new-folder` | codicon |  | Explorer: New Folder |
| `refresh` | codicon | **mapped** | Explorer: Refresh; Git: Refresh (scm/title) |
| `collapse-all` | codicon |  | Explorer/Outline/Problems: Collapse All |
| `toolbar-more` | codicon alias, same glyph as `more` (no inheritance) |  | '...' overflow in every view/editor/panel toolbar |
| `search-show-replace` | registered, default `chevron-down` |  | Search view: replace toggle (expanded state) |
| `search-hide-replace` | registered, default `chevron-right` |  | Search view: replace toggle (collapsed state) |
| `search-replace-all` | registered, default `replace-all` |  | Search view: Replace All |
| `check` | codicon | **mapped** | SCM: Commit (git.commit), menu check marks, quick-pick check |
| `extensions-manage` | registered, default `gear` |  | Extensions list row: Manage gear |
| `debug-start` | codicon (also registered workbench ID) | **mapped** | Run and Debug view: Start Debugging (green play) |

### Tree/list chrome (1)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `tree-item-expanded` | codicon alias, same glyph as `chevron-down` (no inheritance) |  | Twistie chevron in every tree (rotated -90deg when collapsed) |

### Editor chrome (tabs, title, breadcrumbs, gutter) (14)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `close` | codicon | **mapped** | Editor tab close button; generic close |
| `circle-filled` | codicon |  | Editor tab dirty dot (CSS var), Open Editors dirty dot |
| `pinned` | codicon |  | Pinned tab icon / Unpin action |
| `pinned-dirty` | codicon |  | Pinned + dirty tab |
| `split-horizontal` | codicon | **mapped** | Editor title: Split Editor Right; terminal split |
| `split-vertical` | codicon | **mapped** | Editor title: Split Editor Down (Alt) |
| `go-to-file` | codicon | **mapped** | Editor title: Open File (from diff/SCM); settings 'Open JSON' |
| `breadcrumb-separator` | registered, default `chevron-right` |  | Breadcrumbs separator chevron |
| `folding-expanded` | registered, default `chevron-down` |  | Editor gutter: folding chevron (expanded) |
| `folding-collapsed` | registered, default `chevron-right` |  | Editor gutter: folding chevron (collapsed) |
| `gutter-lightbulb` | registered, default `light-bulb` |  | Editor: code-action lightbulb in gutter |
| `light-bulb` | codicon |  | Code action lightbulb (inline) |
| `sparkle` | codicon |  | Inline chat / AI actions (editor toolbar, SCM commit-message generate) |
| `widget-close` | registered, default `close` | themed via `close` | Close button in find/peek/rename widgets |

### Find widget (editor and Search view) (10)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `case-sensitive` | codicon |  | Find/Search: Match Case toggle |
| `whole-word` | codicon |  | Find/Search: Match Whole Word toggle |
| `regex` | codicon |  | Find/Search: Use Regular Expression toggle |
| `preserve-case` | codicon |  | Replace: Preserve Case toggle |
| `find-previous-match` | registered, default `arrow-up` |  | Find widget: Previous Match |
| `find-next-match` | registered, default `arrow-down` |  | Find widget: Next Match |
| `find-collapsed` | registered, default `chevron-right` |  | Find widget: replace toggle (collapsed) |
| `find-expanded` | registered, default `chevron-down` |  | Find widget: replace toggle (expanded) |
| `find-replace` | registered, default `replace` |  | Find widget / Search: Replace |
| `find-replace-all` | registered, default `replace-all` |  | Find widget: Replace All |

### Panel (Problems, Output, Debug Console, Terminal, Ports) (14)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `markers-view-icon` | registered, default `warning` | themed via `warning` | Panel: Problems view icon (shown when labels hidden or view moved) |
| `output-view-icon` | registered, default `output` |  | Panel: Output view icon |
| `debug-console-view-icon` | registered, default `debug-console -> gear` |  | Panel: Debug Console view icon |
| `terminal-view-icon` | registered, default `terminal` | **mapped** | Panel: Terminal view icon |
| `panel-maximize` | registered, default `screen-full` |  | Panel title: Maximize Panel |
| `panel-close` | registered, default `close` | themed via `close` | Panel title: Hide Panel |
| `terminal-new` | registered, default `add` | themed via `add` | Terminal: New Terminal '+' |
| `chevron-down` | codicon |  | Terminal: launch-profile dropdown; select boxes; generic chevron |
| `terminal-kill` | registered, default `trash` | themed via `trash` | Terminal: Kill Terminal (trash) |
| `terminal` | codicon |  | Terminal tab default icon |
| `terminal-decoration-success` | codicon (also registered workbench ID, default `circle-filled`; the codicon copy of the `circle-filled` character wins, rule 5) |  | Terminal gutter: command succeeded (shell integration) |
| `terminal-decoration-error` | codicon (also registered workbench ID, default `error-small`; the codicon copy of the `error-small` character wins, rule 5) |  | Terminal gutter: command failed |
| `clear-all` | codicon |  | Output: Clear Output; generic Clear All |
| `filter` | codicon | **mapped** | Problems/Output filter boxes; generic filter |

### Status bar (11)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `error` | codicon | **mapped** | Status bar Problems count; Problems rows; error decorations |
| `warning` | codicon | **mapped** | Status bar Problems count; Problems rows |
| `info` | codicon | **mapped** | Status bar Problems (infos); notification toasts |
| `bell` | codicon |  | Status bar: Notifications |
| `bell-dot` | codicon |  | Status bar: Notifications (unread) |
| `remote` | codicon |  | Status bar: Remote indicator (bottom-left) |
| `git-branch` | codicon |  | Status bar: current branch (git) |
| `sync` | codicon | **mapped** | Status bar: git sync; Settings Sync |
| `bracket` | codicon |  | Status bar: Language Status '{ }' |
| `copilot` | codicon |  | Status bar: Copilot / chat status |
| `loading` | codicon |  | Spinners ('~spin'): status bar progress, test running, git |

### Notifications, dialogs, quick input, title bar (9)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `notifications-clear` | registered, default `close` | themed via `close` | Notification toast: Clear |
| `notifications-clear-all` | registered, default `clear-all` |  | Notification center: Clear All |
| `notifications-expand` | registered, default `chevron-up` |  | Notification: expand |
| `notifications-configure` | registered, default `gear` |  | Notification: configure gear |
| `quick-input-back` | codicon alias, same glyph as `arrow-left` (no inheritance) |  | Quick input: Back |
| `search` | codicon | **mapped** | Title bar: command center search glyph |
| `arrow-left` | codicon |  | Title bar: Go Back |
| `arrow-right` | codicon |  | Title bar: Go Forward |
| `menu-submenu` | codicon alias, same glyph as `chevron-right` (no inheritance) |  | Context menus: submenu chevron |

### Layout controls (title bar) (7)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `panel-left` | registered, default `layout-sidebar-left` | themed via `layout-sidebar-left` | Toggle Primary Side Bar (visible state) |
| `panel-left-off` | registered, default `layout-sidebar-left-off` |  | Toggle Primary Side Bar (hidden state) |
| `panel-layout-icon` | registered, default `layout-panel` | themed via `layout-panel` | Toggle Panel (visible state) |
| `panel-layout-icon-off` | registered, default `layout-panel-off` |  | Toggle Panel (hidden state) |
| `auxiliarybar-right-layout-icon` | registered, default `layout-sidebar-right` | themed via `layout-sidebar-right` | Toggle Secondary Side Bar (visible state) |
| `auxiliarybar-right-off-layout-icon` | registered, default `layout-sidebar-right-off` |  | Toggle Secondary Side Bar (hidden state) |
| `configure-layout-icon` | registered, default `layout` |  | Customize Layout button |

### Debug toolbar, breakpoints, Run and Debug views (14)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `debug-continue` | codicon (also registered workbench ID) | **mapped** | Debug toolbar: Continue |
| `debug-pause` | codicon (also registered workbench ID) | **mapped** | Debug toolbar: Pause |
| `debug-step-over` | codicon (also registered workbench ID) | **mapped** | Debug toolbar: Step Over |
| `debug-step-into` | codicon (also registered workbench ID) | **mapped** | Debug toolbar: Step Into |
| `debug-step-out` | codicon (also registered workbench ID) | **mapped** | Debug toolbar: Step Out |
| `debug-restart` | codicon (also registered workbench ID) |  | Debug toolbar: Restart |
| `debug-stop` | codicon (also registered workbench ID) | **mapped** | Debug toolbar: Stop |
| `debug-breakpoint` | codicon (also registered workbench ID) |  | Gutter: breakpoint |
| `debug-breakpoint-disabled` | codicon (also registered workbench ID) |  | Gutter: disabled breakpoint |
| `debug-breakpoint-conditional` | codicon (also registered workbench ID) |  | Gutter: conditional breakpoint |
| `debug-breakpoint-log` | codicon (also registered workbench ID) |  | Gutter: logpoint |
| `debug-hint` | codicon (also registered workbench ID) |  | Gutter: breakpoint hover hint |
| `debug-stackframe` | codicon (also registered workbench ID) |  | Gutter: current stack frame |
| `debug-stackframe-focused` | codicon (also registered workbench ID) |  | Gutter: focused stack frame |

### Testing (4)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `testing-run-all-icon` | registered, default `run-all` |  | Testing view: Run All Tests |
| `testing-run-icon` | registered, default `run` | themed via `run` | Gutter / tree row: Run Test |
| `testing-passed-icon` | registered, default `pass` |  | Test result: passed |
| `testing-failed-icon` | registered, default `error` | themed via `error` | Test result: failed |

### Symbols (Outline, breadcrumbs, suggest widget, Go to Symbol) (17)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `symbol-class` | codicon | **mapped** | Class |
| `symbol-method` | codicon | **mapped** | Method |
| `symbol-function` | codicon |  | Function |
| `symbol-field` | codicon |  | Field |
| `symbol-property` | codicon | **mapped** | Property |
| `symbol-variable` | codicon | **mapped** | Variable |
| `symbol-constant` | codicon |  | Constant |
| `symbol-interface` | codicon |  | Interface |
| `symbol-enum` | codicon |  | Enum |
| `symbol-module` | codicon |  | Module |
| `symbol-namespace` | codicon |  | Namespace |
| `symbol-keyword` | codicon |  | Keyword (suggest) |
| `symbol-string` | codicon |  | String |
| `symbol-text` | codicon |  | Plain-text word suggestion |
| `symbol-snippet` | codicon |  | Snippet (suggest) |
| `symbol-file` | codicon |  | File symbol / path completion / breadcrumb file |
| `symbol-folder` | codicon |  | Folder symbol / path completion |

### Diff editor and SCM (8)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `diff-insert` | registered, default `add` | themed via `add` | Diff editor gutter: inserted line |
| `diff-remove` | registered, default `remove` | themed via `remove` | Diff editor gutter: removed line |
| `diff-editor-previous-change` | registered, default `arrow-up` |  | Diff editor title: Previous Change |
| `diff-editor-next-change` | registered, default `arrow-down` |  | Diff editor title: Next Change |
| `add` | codicon | **mapped** | SCM row: Stage Changes '+'; generic add |
| `remove` | codicon | **mapped** | SCM row: Unstage Changes '-' |
| `discard` | codicon |  | SCM row: Discard Changes |
| `list-tree` | codicon |  | SCM / Search: View as Tree |

## Registered IDs the core tables omit

Three IDs that a normal 1.141 session shows are missing from the tables above. The 2.0 spec maps them as extras (section 5.1):

| ID (iconDefinitions key) | Kind / default | Where it appears |
|---|---|---|
| `timeline-view-icon` | registered, default `history` | Timeline view icon (only visible when the view leaves the Explorer container) |
| `debug-stackframe-dot` | codicon | Drawn by CSS `::after` over `debug-stackframe` / `debug-stackframe-focused` when paused on a breakpoint |
| `copilot-unavailable` | codicon | Status bar chat entry where completions are off (by default Markdown and plain text) |

Five more registered IDs appear only when the side bars swap sides or in Customize Layout. The spec maps them as extras too (author decision 7):

| ID (iconDefinitions key) | Kind / default | Where it appears |
|---|---|---|
| `panel-right` / `panel-right-off` | registered, default `layout-sidebar-right` / `layout-sidebar-right-off` | Toggle Primary Side Bar when the side bar is on the right |
| `auxiliarybar-left-layout-icon` / `auxiliarybar-left-off-layout-icon` | registered, default `layout-sidebar-left` / `layout-sidebar-left-off` | Toggle Secondary Side Bar when it is on the left |
| `panel-bottom` | registered, default `layout-panel` | Bottom panel in the layout controls |

Decisions 4 and 5 also pin five codicons that no table above lists: `debug-breakpoint-conditional-disabled`, `debug-breakpoint-log-disabled`, `debug-breakpoint-conditional-unverified`, `copilot-snooze` and `copilot-dot`.

Review gate 1 (spec section 11.1) pins ten more keys, found in the gate captures and in the code-action and git sources:

| ID (iconDefinitions key) | Kind / default | Where it appears |
|---|---|---|
| `gutter-lightbulb-sparkle` | registered, default `lightbulb-sparkle` | Gutter light bulb when an AI fix is offered and no preferred fix (with chat on, the usual quick-fix case) |
| `gutter-lightbulb-auto-fix` | registered, default `lightbulb-autofix` | Gutter light bulb with a preferred quick fix and no AI fix |
| `gutter-lightbulb-aifix-auto-fix` | registered, default `lightbulb-sparkle-autofix` | Gutter light bulb with both a preferred quick fix and an AI fix |
| `lightbulb-sparkle` | codicon | Inline light bulb, AI fix offered; also the inline-edit chat status label |
| `lightbulb-autofix` | codicon | Inline light bulb, preferred quick fix; also the "accept detected language" status entry |
| `lightbulb-sparkle-autofix` | codicon (same character as `lightbulb-sparkle`) | Inline light bulb, preferred quick fix and AI fix |
| `git-branch-changes` | codicon | Status bar branch (git extension) with working-tree or untracked changes |
| `git-branch-staged-changes` | codicon | Status bar branch with staged changes |
| `git-branch-conflicts` | codicon | Status bar branch while a merge or rebase is in progress |
| `ports-forwarded-with-process-icon` | registered, default `circle-filled` | Ports view: a forwarded port with a running process |

The light-bulb widget draws in the gutter only when the line is not indented, the lines above and below are neither blank nor indented, and no other glyph-margin decoration sits on the line; otherwise it draws inline in the text and uses the plain codicons. `light-bulb` and `gutter-lightbulb` were pinned in phase 1. `gutter-lightbulb-sparkle-filled` (registered, default `sparkle-filled`: every action on the line is an AI action) and the codicon `sparkle-filled` stay unpinned for now; gate 2 decided that `gutter-lightbulb-sparkle-filled` joins the editor batch on the ✧ cluster at gate 4 (spec section 11.2).

## Extended tier: seen regularly but in narrower situations

### Activity Bar and side bar containers (1)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `more` | codicon |  | Activity Bar overflow '...' (additional views) |

### View title actions (Explorer, Search, SCM, Run, Extensions) (19)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `close-all` | codicon |  | Open Editors: Close All |
| `save-all` | codicon |  | Open Editors: Save All |
| `search-refresh` | registered, default `refresh` | themed via `refresh` | Search view: Refresh |
| `search-clear-results` | registered, default `clear-all` |  | Search view: Clear Results |
| `search-new-editor` | registered, default `new-file` |  | Search view: Open New Search Editor |
| `search-collapse-results` | registered, default `collapse-all` |  | Search view: Collapse All |
| `search-expand-results` | registered, default `expand-all` |  | Search view: Expand All |
| `search-tree` | registered, default `list-tree` |  | Search view: View as Tree |
| `search-list` | registered, default `list-flat` |  | Search view: View as List |
| `search-details` | registered, default `ellipsis` | themed via `ellipsis` | Search view: Toggle Search Details '...' |
| `search-remove` | registered, default `close` | themed via `close` | Search result row: Dismiss |
| `extensions-filter` | registered, default `filter` | themed via `filter` | Extensions view: Filter |
| `extensions-clear-search-results` | registered, default `clear-all` |  | Extensions view: Clear Search Results |
| `extensions-refresh` | registered, default `refresh` | themed via `refresh` | Extensions view: Refresh |
| `extensions-install-count` | registered, default `cloud-download` |  | Extensions list row: install count |
| `extensions-rating` | registered, default `star` |  | Extensions list row: rating star |
| `extensions-verified-publisher` | registered, default `verified-filled` |  | Extensions list row: verified publisher badge |
| `extension-default-icon` | registered, default `extensions-large` |  | Extension with no logo (list/editor) |
| `debug-configure` | registered, default `gear` |  | Run and Debug view: Open launch.json gear |

### Tree/list chrome (5)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `tree-item-loading` | codicon alias, same glyph as `loading` (no inheritance) |  | Tree node loading spinner |
| `tree-filter-on-type-on` | codicon alias, same glyph as `list-filter` (no inheritance) |  | Tree find/filter widget: filter mode toggle |
| `tree-filter-clear` | codicon alias, same glyph as `close` (no inheritance) |  | Tree find widget: clear |
| `expand-all` | codicon |  | Expand All actions |
| `close-dirty` | codicon |  | Open Editors / quick pick: dirty item close button |

### Editor chrome (tabs, title, breadcrumbs, gutter) (9)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `open-preview` | codicon |  | Editor title: Markdown Open Preview to the Side |
| `compare-changes` | codicon |  | Editor title: Open Changes (git) |
| `gutter-lightbulb-auto-fix` | registered, default `lightbulb-autofix` |  | Editor: auto-fix lightbulb in gutter |
| `gutter-lightbulb-sparkle` | registered, default `lightbulb-sparkle` |  | Editor: AI code-action lightbulb |
| `suggest-more-info` | registered, default `chevron-right` |  | Suggest widget: Read More chevron |
| `parameter-hints-next` | registered, default `chevron-down` |  | Parameter hints: next overload |
| `parameter-hints-previous` | registered, default `chevron-up` |  | Parameter hints: previous overload |
| `marker-navigation-next` | registered, default `arrow-down` |  | Error peek (F8): next problem |
| `marker-navigation-previous` | registered, default `arrow-up` |  | Error peek (F8): previous problem |

### Find widget (editor and Search view) (1)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `find-selection` | registered, default `selection` |  | Find widget: Find in Selection |

### Panel (Problems, Output, Debug Console, Terminal, Ports) (10)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `ports-view-icon` | registered, default `plug` |  | Panel: Ports view icon (remote sessions) |
| `terminal-powershell` | codicon |  | Terminal tab icon: PowerShell profile |
| `terminal-bash` | codicon |  | Terminal tab icon: bash profile (WSL/Linux remote) |
| `terminal-decoration-incomplete` | registered, default `circle` |  | Terminal gutter: command incomplete |
| `terminal-decoration-mark` | registered, default `circle-small-filled` |  | Terminal gutter: command mark |
| `debug-console-clear-all` | registered, default `clear-all` |  | Debug Console: Clear Console |
| `lock` | codicon |  | Output: Turn Auto Scrolling On/Off (locked) |
| `unlock` | codicon |  | Output: auto-scroll (unlocked) |
| `filter-filled` | codicon |  | Problems: filter active |
| `ports-forward-icon` | registered, default `plus` |  | Ports: Forward a Port |

### Status bar (6)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `bell-slash` | codicon |  | Status bar: Do Not Disturb |
| `bell-slash-dot` | codicon |  | Status bar: Do Not Disturb (unread) |
| `cloud-upload` | codicon |  | Status bar / SCM: Publish Branch |
| `bracket-dot` | codicon |  | Status bar: Language Status with warning |
| `copilot-warning` | codicon |  | Status bar: Copilot warning state |
| `radio-tower` | codicon |  | Status bar: forwarded ports count |

### Notifications, dialogs, quick input, title bar (10)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `notifications-collapse` | registered, default `chevron-down` |  | Notification: collapse |
| `notifications-hide` | registered, default `chevron-down` |  | Notification center: hide |
| `notifications-do-not-disturb` | registered, default `bell-slash` |  | Notification center: Do Not Disturb |
| `dialog-error` | codicon alias, same glyph as `error` (no inheritance) |  | Modal dialog: error glyph |
| `dialog-warning` | codicon alias, same glyph as `warning` (no inheritance) |  | Modal dialog: warning glyph |
| `dialog-info` | codicon alias, same glyph as `info` (no inheritance) |  | Modal dialog: info glyph |
| `dialog-close` | codicon alias, same glyph as `close` (no inheritance) |  | Modal dialog: close |
| `remove-close` | codicon |  | Quick open: Remove from Recently Opened; remove breakpoint |
| `menu` | codicon | **mapped** | Title bar: hamburger menu (compact menu bar) |
| `menu-selection` | codicon alias, same glyph as `check` (no inheritance) |  | Context menus: checked item |

### Debug toolbar, breakpoints, Run and Debug views (10)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `debug-gripper` | registered, default `gripper` |  | Floating debug toolbar: drag handle |
| `debug-disconnect` | codicon (also registered workbench ID) |  | Debug toolbar: Disconnect (attach sessions) |
| `debug-breakpoint-unverified` | codicon (also registered workbench ID) |  | Gutter: unverified breakpoint |
| `debug-breakpoint-function` | codicon (also registered workbench ID) |  | Breakpoints view: function breakpoint |
| `breakpoints-activate` | registered, default `activate-breakpoints` |  | Breakpoints view: Toggle Activate Breakpoints |
| `breakpoints-remove-all` | registered, default `close-all` |  | Breakpoints view: Remove All |
| `watch-expressions-add` | registered, default `add` | themed via `add` | Watch view: Add Expression |
| `watch-expressions-remove-all` | registered, default `close-all` |  | Watch view: Remove All |
| `debug-collapse-all` | registered, default `collapse-all` |  | Variables/Watch: Collapse All |
| `callstack-view-session` | registered, default `bug` |  | Call Stack: session row icon |

### Testing (12)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `testing-debug-all-icon` | registered, default `debug-alt-small` |  | Testing view: Debug All Tests |
| `testing-debug-icon` | registered, default `debug-alt-small` |  | Gutter / tree row: Debug Test |
| `testing-rerun-icon` | registered, default `debug-rerun` |  | Testing view: Rerun Last Run |
| `testing-coverage-icon` | registered, default `run-coverage` |  | Run Test with Coverage |
| `testing-cancel-icon` | registered, default `debug-stop` | themed via `debug-stop` | Testing view: Cancel Test Run |
| `testing-refresh-tests` | registered, default `refresh` | themed via `refresh` | Testing view: Refresh Tests |
| `testing-filter` | registered, default `filter` | themed via `filter` | Testing view: Filter |
| `testing-show-as-list-icon` | registered, default `list-tree` |  | Testing view: View as List/Tree |
| `testing-error-icon` | registered, default `issues` |  | Test result: errored |
| `testing-skipped-icon` | registered, default `debug-step-over` | themed via `debug-step-over` | Test result: skipped |
| `testing-queued-icon` | registered, default `history` |  | Test result: queued |
| `testing-unset-icon` | registered, default `circle-outline` |  | Test result: not yet run |

### Symbols (Outline, breadcrumbs, suggest widget, Go to Symbol) (6)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `symbol-constructor` | codicon |  | Constructor |
| `symbol-enum-member` | codicon |  | Enum member |
| `symbol-struct` | codicon |  | Struct |
| `symbol-key` | codicon |  | Key (JSON/YAML outline) |
| `symbol-event` | codicon |  | Event |
| `symbol-type-parameter` | codicon |  | Type parameter |

### Diff editor and SCM (8)

| ID (iconDefinitions key) | Kind / default | Current theme | Where it appears |
|---|---|---|---|
| `diff-editor-toggle-whitespace` | registered, default `whitespace` |  | Diff editor title: Show/Hide Whitespace |
| `diff-multiple` | codicon |  | SCM group: View All Changes (multi-diff) |
| `list-flat` | codicon |  | SCM / Search: View as List |
| `git-commit` | codicon |  | SCM graph / commit rows |
| `git-fetch` | codicon |  | SCM graph title: Fetch |
| `repo-pull` | codicon |  | SCM graph title: Pull |
| `repo-push` | codicon |  | SCM graph title: Push |
| `plus` | codicon |  | Generic '+' (separate codicon from 'add', same glyph): ports forward, git create branch |


## Findings about the current 48

### Keys that are real but do not do what their names suggest

| Current key | Verdict |
|---|---|
| `activity-bar-left`, `activity-bar-right` | Real registered IDs (`layoutActions.ts`, defaults `layout-activitybar-left` / `-right`). They only appear as row icons in the **Customize Layout** quick pick (Activity Bar Position). They are **not** the Activity Bar and not the title-bar layout toggles. Very low visibility. If the goal was the title-bar toggles, the keys are `panel-left` / `panel-left-off`, `panel-layout-icon` / `panel-layout-icon-off`, `auxiliarybar-right-layout-icon` / `auxiliarybar-right-off-layout-icon` and `configure-layout-icon`. |
| `debug-alt` | Codicon. It works **indirectly**: `run-view-icon` (the Run and Debug Activity Bar item) defaults to `debug-alt`, and so do `watch-view-icon`, `callstack-view-icon`, `breakpoints-view-icon` and `loaded-scripts-view-icon`. It also replaces 6 hardcoded `debug-alt` uses. Add `run-view-icon` as the precise key. Keeping `debug-alt` too is fine. |
| `settings-gear` | Codicon. It works **indirectly**: `settings-view-bar-icon` (the Manage gear) defaults to `settings-gear`, which also has about 19 hardcoded uses. Add `settings-view-bar-icon` if the Manage gear should differ from other gears. |
| `account` | Codicon. Works indirectly through `accounts-view-bar-icon`. Add the precise key. |
| `layout-sidebar-left`, `layout-sidebar-right`, `layout-panel` | Codicons. They theme only the **on** states of the title-bar toggles: `panel-left`, `auxiliarybar-right-layout-icon` and `panel-layout-icon` inherit from them. The **off** states (`panel-left-off` -> `layout-sidebar-left-off`, `auxiliarybar-right-off-layout-icon` -> `layout-sidebar-right-off`, `panel-layout-icon-off` -> `layout-panel-off`) are unmapped. Each toggle therefore flips between the WitchyNibbles glyph and the stock codicon. Map the three `-off` codicons, or the six registered keys. |
| `ellipsis` | Does **not** cover the `...` overflow in view, editor and panel toolbars, which is `toolbar-more` (an alias of `more` that does not inherit). It does not cover the Activity Bar overflow (`more`) either. Only a few places use `ellipsis`, such as `search-details`. Low value as is. Map `toolbar-more` (and `more`). |
| `search` | Correct as a codicon. It is the command-center glyph in the title bar and appears in 14 hardcoded places. The Search Activity Bar item is `search-view-icon` (default `search-large`, not `search`), which is already mapped separately. |
| `terminal-view-icon` | Correct key, but the panel shows text labels by default, so this icon appears only when labels are hidden or the view is moved. The terminal **tab** icon is the `terminal` codicon (or the profile icon, such as `terminal-powershell` or `terminal-bash`), which is unmapped. |

### Keys with little or no visibility

| Current key | Verdict |
|---|---|
| `home` | Effectively invisible. In 1.141 `A.home` appears only in an icon-picker glyph list, and no workbench UI uses it. |
| `file`, `folder` | Rarely visible. Trees replace `ThemeIcon.File` / `ThemeIcon.Folder` with **file icon theme** glyphs. The codicons appear only in chat attachment pills, AI customization lists and a few hovers. Code completion and breadcrumbs use `symbol-file` / `symbol-folder` instead. |
| `menu` | Visible only in the compact or hamburger menu bar (narrow window, or `window.menuBarVisibility: compact`). |
| `copy`, `edit`, `save` | Real, but mostly in context menus, hovers and notebooks. Little everyday visibility. |
| `split-vertical` | Shown only while Alt is held on the editor Split button, and for the notebook Split Cell action. |

### Keys that are correct and high value

`close`, `check`, `add`, `remove`, `refresh`, `sync`, `go-to-file`, `filter`, `trash` (inherited by `terminal-kill`), `run` (inherited by `debug-run` and `testing-run-icon`), `error` / `warning` / `info` (inherited by `markers-view-icon` and `testing-failed-icon`; these are the status bar Problems glyphs), `split-horizontal`, `explorer-view-icon`, `search-view-icon`, `source-control-view-icon`, `extensions-view-icon`, all `debug-*` toolbar keys, and the four `symbol-*` keys.

Caveats:

- `dialog-error`, `dialog-warning`, `dialog-info` and `dialog-close` are aliases and do **not** pick up the `error`, `warning`, `info` or `close` mappings.
- `plus` is a separate codicon from `add`, with the same glyph. It does not inherit `add`.
- `close` is inherited by `widget-close`, `panel-close`, `notifications-clear`, `search-remove` and others, but not by `tree-filter-clear` or `dialog-close`.

### Biggest gaps (high visibility, stock codicon today)

- **Activity Bar:** `test-view-icon`, `remote-explorer-view-icon`, `chat-view-icon`
- **Trees:** `tree-item-expanded` (every tree twistie), `view-pane-container-expanded` / `-collapsed`
- **Toolbars:** `toolbar-more`, `new-file`, `new-folder`, `collapse-all`
- **Editor tabs:** `circle-filled` (dirty dot), `pinned`, `pinned-dirty`
- **Editor gutter:** `folding-expanded` / `folding-collapsed`, `gutter-lightbulb`, `light-bulb`, `debug-breakpoint*`, `debug-stackframe*`
- **Find widget:** `case-sensitive`, `whole-word`, `regex`
- **Status bar:** `bell` / `bell-dot`, `remote`, `git-branch`, `bracket`, `copilot`
- **Title-bar layout toggles:** the three `-off` states
- **Panel and terminal:** `chevron-down`, `terminal`
- **Symbols:** the remaining `symbol-*` IDs

## Sources

- Product icon theme guide: https://code.visualstudio.com/api/extension-guides/product-icon-theme. It covers the `iconDefinitions` and `fonts` format and finding IDs through the `codicon-<id>` class in DevTools. It says themes can replace "each icon individually, as well as all icons from the codicon library".
- Icon reference: https://code.visualstudio.com/api/references/icons-in-labels. It defines the columns identifier / default codicon ID / description: "the default codicon ID describes which icon from the codicon library is used by default". Rows checked: `explorer-view-icon` -> `files`, `run-view-icon` -> `debug-alt`, `settings-view-bar-icon` -> `settings-gear`.
- Resolver source: https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/browser/productIconThemeData.ts (`_resolveIconDefinition`, quoted above).
- Icon registry: `src/vs/platform/theme/common/iconRegistry.ts` (`registerIcon`, where first registration wins; `initialize()`, which registers every codicon with a fontCharacter; `IconContribution.getDefinition`).
- Codicons: `src/vs/base/common/codiconsUtil.ts` (`register(id, fontCharacter | aliasId)`, which copies the character) and `src/vs/base/common/codicons.ts` (`codiconsDerived`: `dialog-*`, `tree-item-expanded`, `toolbar-more`, `menu-submenu`, and so on).
- CSS generation: `src/vs/platform/theme/browser/iconsStyleSheet.ts` (`getCSS`).
- Layout toggles: `src/vs/workbench/browser/actions/layoutActions.ts`, `src/vs/workbench/browser/parts/panel/panelActions.ts` and `src/vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions.ts`. In the 1.141 bundle, `LayoutControlMenu` items use `panel-left` / `panel-left-off`, `panel-layout-icon` / `-off`, `auxiliarybar-right-layout-icon` / `-off` and `configure-layout-icon`.
- Local install used for extraction: `/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js` (registerIcon is minified to `ze`, the resolver to `iIr`, the stylesheet to `qci`), `.../out/nls.messages.json` (descriptions) and `.../workbench.desktop.main.css` (`var(--vscode-icon-*-content)` consumers).
- Git extension (SCM icons): `.../resources/app/extensions/git/package.json` and `dist/main.js`. Commit `$(check)`, refresh `$(refresh)`, stage `$(add)`, unstage `$(remove)`, discard `$(discard)`, open file `$(go-to-file)`, open changes `$(compare-changes)`, branch `$(git-branch)`, publish `$(cloud-upload)`, graph `$(git-fetch)` / `$(repo-pull)` / `$(repo-push)`.
- The keys this repo relies on are pinned in `icons/product-icon-ids.json` (170 keys with kind, default and batch). `node scripts/extract-icon-ids.mjs [bundle]` diffs a local workbench bundle against that pin. The earlier `reg.tsv`/`registry.json` were never committed.

## Out of scope for product icon themes

- File icons belong to the file icon theme.
- Extension view-container and command icons that ship as SVG or PNG paths can't be themed. This covers, for example, Docker, GitLens and Python view containers.
- Extension icons that use `$(codicon)` names do pick up mappings for those codicon IDs.

## Audit: `circle-filled` (before the 2.0 ✦ re-mapping)

Checked against the 1.141 bundle (`workbench.desktop.main.js` and `workbench.desktop.main.css` in `2a59476c9b/`) on 2026-10-10. `test/circle-filled-audit.test.mjs` re-runs the registry part whenever the bundle is present.

Mapping `circle-filled` to the ✦ dirty mark also changes:

- Registered IDs that inherit it: only `ports-forwarded-with-process-icon` (Ports view, extended tier). Since gate 1 (G4) it is pinned in the `status` batch and shares the small-dot drawing of `terminal-decoration-success`.
- Not inherited, although the bundle calls `registerIcon("terminal-decoration-success", circleFilled)`: the codicon table registers `terminal-decoration-success` first, with its own copy of the `circle-filled` character (60017), and the first registration wins (rule 5). The terminal gutter success mark therefore stays on the stock Codicon dot until the `status` batch maps `terminal-decoration-success` by its own key. `debug-hint` is a codicon copy of 60017 in the same way. The phase-1 plan (Review Focus 5) expected the gutter to inherit the ✦; it does not.
- CSS consumers of `--vscode-icon-circle-filled-*`: the dirty editor tab action and the dirty Open Editors row (both wanted).
- Direct uses of the glyph in the workbench code: the dirty-file indicator in the Quick Open history list (wanted, same meaning), chat "thinking" rows and their spinner item, agent-session status and read indicators, the merge editor's "Accept (result is dirty)" toggle state, the colour swatches in the terminal "change color" quick pick, profile list items, and the "Start Extension Host Profile" and "Profile Local Agent Host Process" actions.
- `circle-filled-compact` (chat thinking and read indicators) is a separate codicon with its own character and is not affected.
- Phase 1 renders all of the affected uses as ✦. The review gate shows Open Editors and the dirty tab; the author decides whether any other consumer needs its own key.
