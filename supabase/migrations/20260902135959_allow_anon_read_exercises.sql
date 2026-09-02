-- Let signed-out visitors browse the exercise catalogue.
--
-- v1 gave `exercises` a single SELECT policy scoped `to authenticated`, so the
-- library page returned zero rows for anyone not logged in. Replacing it with
-- one policy covering both roles, rather than adding a second policy beside it
-- — two policies expressing the same rule are two things to keep in sync.
--
-- Still read-only. There is deliberately no INSERT, UPDATE or DELETE policy:
-- under RLS the absence of a policy IS the denial, so the catalogue stays
-- writable only via migrations and the service role.

drop policy "exercises: read all" on exercises;

create policy "exercises: read all"
  on exercises for select
  to anon, authenticated
  using (true);
