-- 015_server_managed_votes.sql
-- Public board votes are written through Next.js API routes using the service
-- role client. Direct browser/client writes are not part of the product API.

drop policy if exists "Anyone can insert votes" on public.votes;
drop policy if exists "Anyone can delete own votes" on public.votes;
drop policy if exists "Service role manages vote deletes" on public.votes;

create policy "votes_no_client_inserts" on public.votes
  for insert
  with check (false);

create policy "votes_no_client_updates" on public.votes
  for update
  using (false)
  with check (false);

create policy "votes_no_client_deletes" on public.votes
  for delete
  using (false);
