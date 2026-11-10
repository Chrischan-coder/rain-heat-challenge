-- Run this once in the Supabase SQL Editor for the RAIN–HEAT game.

create table if not exists public.rainheat_leaderboard (
  player_id uuid primary key,
  nickname text not null check (char_length(nickname) between 2 and 16),
  score integer not null check (score between 0 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rainheat_leaderboard enable row level security;
revoke all on table public.rainheat_leaderboard from anon, authenticated;

create or replace function public.get_rainheat_leaderboard(p_player_id uuid default null)
returns table (
  player_id uuid,
  nickname text,
  score integer,
  player_rank bigint,
  is_self boolean
)
language sql
security definer
set search_path = ''
as $function$
  with players as (
    select
      (array_agg(board.player_id order by board.score desc, board.created_at asc, board.player_id asc))[1] as player_id,
      (array_agg(board.nickname order by board.score desc, board.created_at asc, board.player_id asc))[1] as nickname,
      max(board.score) as score,
      min(board.created_at) as created_at,
      coalesce(bool_or(board.player_id = p_player_id), false) as is_self
    from public.rainheat_leaderboard as board
    group by lower(btrim(board.nickname))
  ), ranked as (
    select
      players.player_id,
      players.nickname,
      players.score,
      players.is_self,
      row_number() over (
        order by players.score desc, players.created_at asc, players.player_id asc
      ) as player_rank
    from players
  )
  select
    ranked.player_id,
    ranked.nickname,
    ranked.score,
    ranked.player_rank,
    ranked.is_self
  from ranked
  where ranked.player_rank <= 5
     or (p_player_id is not null and ranked.is_self)
  order by ranked.player_rank;
$function$;

create or replace function public.submit_rainheat_score(
  p_player_id uuid,
  p_nickname text,
  p_score integer
)
returns table (
  player_id uuid,
  nickname text,
  score integer,
  player_rank bigint,
  is_self boolean
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if p_player_id is null then
    raise exception 'Player ID is required';
  end if;
  if p_nickname is null or char_length(btrim(p_nickname)) not between 2 and 16 then
    raise exception 'Nickname must contain 2 to 16 characters';
  end if;
  if p_score is null or p_score < 0 or p_score > 300 then
    raise exception 'Score must be between 0 and 300';
  end if;

  insert into public.rainheat_leaderboard as existing (player_id, nickname, score)
  values (p_player_id, btrim(p_nickname), p_score)
  -- The function's RETURNS TABLE also declares an output variable named
  -- player_id, so use the primary-key constraint name to avoid ambiguity.
  on conflict on constraint rainheat_leaderboard_pkey do update
  set nickname = excluded.nickname,
      score = greatest(existing.score, excluded.score),
      updated_at = now();

  return query
    select * from public.get_rainheat_leaderboard(p_player_id);
end;
$function$;

revoke all on function public.get_rainheat_leaderboard(uuid) from public;
revoke all on function public.submit_rainheat_score(uuid, text, integer) from public;
grant execute on function public.get_rainheat_leaderboard(uuid) to anon, authenticated;
grant execute on function public.submit_rainheat_score(uuid, text, integer) to anon, authenticated;
