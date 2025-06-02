-- Habilita a extensão pgcrypto se ainda não estiver habilitada
create extension if not exists pgcrypto;

-- Função para gerar hash de senha
create or replace function hash_password(password text)
returns text
language plpgsql
as $$
begin
  return crypt(password, gen_salt('bf', 8));
end;
$$;

-- Função para atualizar senha de um usuário
create or replace function update_user_password(
  p_user_id uuid,
  p_new_password text
)
returns void
language plpgsql
security definer
as $$
begin
  update custom_users
  set password = hash_password(p_new_password),
      updated_at = now()
  where id = p_user_id;
end;
$$;

-- Trigger para automaticamente hashear senhas novas
create or replace function hash_password_trigger()
returns trigger
language plpgsql
as $$
begin
  -- Só hasheia se a senha foi alterada
  if TG_OP = 'INSERT' or new.password != old.password then
    new.password = hash_password(new.password);
  end if;
  return new;
end;
$$;

-- Aplica o trigger na tabela
drop trigger if exists hash_password_trigger on custom_users;
create trigger hash_password_trigger
  before insert or update on custom_users
  for each row
  execute function hash_password_trigger();

-- Atualiza as senhas existentes (execute apenas uma vez)
-- Substitua 'sua_senha_padrao' pela senha desejada
update custom_users
set password = hash_password(password)
where id = '778c3230-7c3e-46cc-945b-ae32e4d6e98'; 