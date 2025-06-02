-- Função para autenticar usuário de forma segura
create or replace function authenticate_user(
  p_name text,
  p_password text
)
returns json
language plpgsql
security definer
as $$
declare
  v_user record;
  v_result json;
  v_hashed_attempt text;
begin
  -- Log inicial
  raise notice 'Tentativa de autenticação para usuário: %', p_name;
  
  -- Busca o usuário (removendo espaços em branco do nome)
  select *
  into v_user
  from custom_users
  where trim(name) = trim(p_name)
    and active = true;
    
  if v_user.id is null then
    raise notice 'Usuário não encontrado: %', p_name;
    return json_build_object(
      'success', false,
      'message', 'Usuário não encontrado'
    );
  end if;

  -- Tenta validar a senha
  if v_user.password = crypt(p_password, v_user.password) then
    -- Define o usuário na sessão atual
    perform set_request_user(v_user.id::uuid);
    
    raise notice 'Autenticação bem-sucedida para usuário: %', p_name;
    
    -- Retorna os dados do usuário (exceto a senha)
    return json_build_object(
      'success', true,
      'user', json_build_object(
        'id', v_user.id,
        'name', v_user.name,
        'active', v_user.active,
        'is_admin', v_user.is_admin,
        'created_at', v_user.created_at
      )
    );
  else
    raise notice 'Senha inválida para usuário: %', p_name;
    return json_build_object(
      'success', false,
      'message', 'Senha inválida'
    );
  end if;
end;
$$; 