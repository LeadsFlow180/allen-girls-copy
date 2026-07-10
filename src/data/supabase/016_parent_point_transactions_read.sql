-- Parents can read point transaction history for approved children

drop policy if exists "pt_select_parent" on public.point_transactions;
create policy "pt_select_parent"
  on public.point_transactions for select
  using (
    exists (
      select 1
      from public.student_profiles sp
      where sp.user_id = point_transactions.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null
    )
  );

notify pgrst, 'reload schema';
