-- Habilita RLS para as tabelas
alter table products enable row level security;
alter table equivalences enable row level security;

-- Função auxiliar para verificar se o usuário está autenticado
create or replace function is_authenticated()
returns boolean
language plpgsql
security definer
as $$
begin
  return (current_setting('request.user.id', true))::uuid is not null;
end;
$$;

-- Política para tabela products
create policy "Usuários autenticados podem ver todos os produtos"
  on products
  for select
  to authenticated
  using (is_authenticated());

create policy "Usuários autenticados podem inserir produtos"
  on products
  for insert
  to authenticated
  with check (is_authenticated());

create policy "Usuários autenticados podem atualizar produtos"
  on products
  for update
  to authenticated
  using (is_authenticated())
  with check (is_authenticated());

create policy "Usuários autenticados podem deletar produtos"
  on products
  for delete
  to authenticated
  using (is_authenticated());

-- Política para tabela equivalences
create policy "Usuários autenticados podem ver todas as equivalências"
  on equivalences
  for select
  to authenticated
  using (is_authenticated());

create policy "Usuários autenticados podem inserir equivalências"
  on equivalences
  for insert
  to authenticated
  with check (is_authenticated());

create policy "Usuários autenticados podem atualizar equivalências"
  on equivalences
  for update
  to authenticated
  using (is_authenticated())
  with check (is_authenticated());

create policy "Usuários autenticados podem deletar equivalências"
  on equivalences
  for delete
  to authenticated
  using (is_authenticated()); 