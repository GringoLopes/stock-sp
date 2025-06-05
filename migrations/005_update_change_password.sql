-- Atualiza a função de troca de senha para validar mínimo de 6 caracteres
create or replace function change_user_password(
  p_user_id uuid,
  p_current_password text,
  p_new_password text
)
returns json
language plpgsql
security definer
as $$
declare
  v_user record;
  v_current_hashed text;
begin
  -- Busca o usuário
  select * into v_user
  from custom_users
  where id = p_user_id;

  -- Verifica se o usuário existe
  if v_user.id is null then
    return json_build_object(
      'success', false,
      'message', 'Usuário não encontrado'
    );
  end if;

  -- Verifica se a senha atual está correta
  if v_user.password != crypt(p_current_password, v_user.password) then
    return json_build_object(
      'success', false,
      'message', 'Senha atual incorreta'
    );
  end if;

  -- Validação de tamanho mínimo (6 caracteres)
  if length(p_new_password) < 6 then
    return json_build_object(
      'success', false,
      'message', 'Nova senha deve ter pelo menos 6 caracteres'
    );
  end if;

  -- Validação contra senha padrão
  if p_new_password = '1234' then
    return json_build_object(
      'success', false,
      'message', 'Nova senha não pode ser igual à senha padrão'
    );
  end if;

  -- Validação se é diferente da atual
  if p_current_password = p_new_password then
    return json_build_object(
      'success', false,
      'message', 'Nova senha deve ser diferente da senha atual'
    );
  end if;

  -- Atualiza a senha e os campos de controle
  update custom_users
  set 
    password = crypt(p_new_password, gen_salt('bf', 8)),
    must_change_password = false,
    password_changed_at = now(),
    updated_at = now()
  where id = p_user_id;

  return json_build_object(
    'success', true,
    'message', 'Senha alterada com sucesso'
  );
end;
$$; 