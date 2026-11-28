# Blog: guide for the team

Everything about the blog is in the admin at `/admin`. This page explains each screen.

## Roles

Each team member has a role (set by an admin under **Settings › Users**):

| Role   | Can do                                                                                   |
| ------ | ---------------------------------------------------------------------------------------- |
| Admin  | Everything, including adding users and deleting blog categories.                         |
| Editor | Write, publish and edit all content, moderate comments. Cannot manage users or delete categories. |
| Viewer | Open every screen and see everything, but save nothing.                                  |

Every change is recorded under **Settings › Activity log**: who changed what, when, and which fields.

## Blog posts (Content › Blog posts)

The list shows each post's cover, title (green once it is live), category, author, creation date,
status and a star for featured posts (click the star to feature or unfeature).

- **Search** by title, address or post ID. Search, filters and sorting are remembered while you work.
- **Tabs and filters**: published, scheduled and draft posts; filter by status, category or author.
- **More columns**: the columns button adds publish date, views, likes and comments.
- **Export**: downloads every post that matches the current tab, search and filters, as Excel or CSV.
  To export only some posts, tick them and choose **Export selected**.
- **Bulk actions** on ticked posts: Publish, Move to drafts, Export selected, Delete.
- **View on blog** opens a live post in a new tab.

## Writing a post

The story is on the left, the settings on the right.

- **Title**: press Enter to move on; titles stay on one line.
- **Address**: filled from the title while empty. Changing it after publishing breaks links people
  already shared. The **Permalink** below it is the full public address, with a Copy button.
- **Excerpt**: one or two sentences (up to 300 characters, counted as you type). Shown on post
  cards, in search results and in the RSS feed.
- **Search & sharing**: a live preview of the Google result. Open **Edit SEO meta** to write a
  different title (up to 70 characters) or description (up to 160) for search engines; empty
  fields fall back to the title and excerpt.
- **Richtext content**: the article. Use **Heading 2** for sections and **Heading 3** inside them;
  they become the table of contents beside the article. The toolbar also has lead and small text,
  colours from the brand palette, alignment, quotes, code, lists, tables, collapsible FAQ blocks
  and image upload. Under the editor you see words, reading time, headings and images as you type.

On the right:

- **Publish**: Draft or Published. **Publish at** with a later date schedules the post; it goes
  live by itself. **Featured** shows the post large at the top of the blog. Save, or Save & exit.
  Admins can credit another author; editors always write as themselves.
- **Category**: one per post. **Add** creates a new one without leaving the page; **Manage**
  opens the category list.
- **Cover**: landscape, at least 2000 px wide. The editor can crop to 16:9, 3:2 or 4:5. Add a
  caption or credit and a short description for screen readers. Without a cover, the first image
  in the article is used.
- **Tags**: type and press Enter.
- **Story details**: views, likes, comments (and how many wait for approval), reading time, author
  and when it was last edited.

At the top of the page:

- **Copy article** gives each part of the post, as it is in the form now (saved or not), with a
  copy button: title, meta title and description, address, public URL, and the article as rich
  text (pastes into WordPress, Google Docs, Medium), HTML or Markdown.
- **Preview** (drafts and scheduled posts) opens a private link that works for 24 hours.
- **Save changes** (also Ctrl/Cmd + S) and **Delete**.

## Categories (Content › Blog posts › Categories)

Name, address and a short description shown on the category page. Drag rows to set the order of
the category buttons on the blog. Each category with published posts gets its own page at
`/blog/category/{address}`. A category that still has posts cannot be deleted, and only admins
delete categories.

## Comments (Inbox › Comments)

Readers' comments wait here until someone approves them; the number in the menu is how many are
waiting, and the bell at the top shows a notification for each new one. The list opens on
**Pending**; use the filter to see approved or hidden comments, or the comments on one post.

- **Approve**: the comment appears under the post.
- **Hide**: it stays off the website (you can approve it later).
- **Delete**: removes it for good.

Tick several comments to approve, hide or delete them together. Comments can't be edited.

## On the website

While you are signed in to the admin, the blog shows an **Edit post** button under each post's
title and a pencil on each post card (on hover, or always on phones). They open the editor in a
new tab. Viewers see **Open in admin** instead, which opens the post read-only. Readers never see
these buttons.

Readers can like a post (once each) and leave a comment, which waits for approval. Each post also
gets a generated share image (title, category, author and cover) for links shared on social media
and in chat apps.

## Sample content

To try the blog on a local copy, run `php artisan db:seed --class=BlogDemoSeeder` in `backend/`.
It adds 10 sample posts in 6 categories with comments and likes. Don't run it on the live site.
