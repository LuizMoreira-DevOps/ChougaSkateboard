
-- CHOUGA V2 | SOMENTE SUPABASE DEVELOPMENT
-- Uma chamada RPC = uma transação por produto.
-- Nunca executar no projeto de produção.

CREATE OR REPLACE FUNCTION public.sync_catalog_product_dev(
  p_payload jsonb,
  p_expected_id uuid DEFAULT NULL,
  p_expected_price numeric DEFAULT NULL,
  p_expected_updated_at timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_fields jsonb;
  v_images jsonb;
  v_variants jsonb;
  v_tags jsonb;
  v_item jsonb;
  v_key text;

  v_desired public.produtos%ROWTYPE;
  v_product public.produtos%ROWTYPE;
  v_variant public.variacoes_produto%ROWTYPE;

  v_exists boolean;
  v_changed boolean := false;
  v_created boolean := false;

  v_image_url text;
  v_sku text;
  v_color_id uuid;
  v_size_id uuid;
  v_tag_id uuid;
  v_primary boolean;

  v_images_added integer := 0;
  v_variants_added integer := 0;
  v_tags_linked integer := 0;
BEGIN
  IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Payload inválido';
  END IF;

  v_fields := p_payload->'fields';
  v_images := COALESCE(p_payload->'images', '[]'::jsonb);
  v_variants := COALESCE(p_payload->'variants', '[]'::jsonb);
  v_tags := COALESCE(p_payload->'tags', '[]'::jsonb);

  IF jsonb_typeof(v_fields) IS DISTINCT FROM 'object'
     OR jsonb_typeof(v_images) IS DISTINCT FROM 'array'
     OR jsonb_typeof(v_variants) IS DISTINCT FROM 'array'
     OR jsonb_typeof(v_tags) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Estrutura do payload inválida';
  END IF;

  -- O sincronizador deve fornecer o contrato completo.
  FOREACH v_key IN ARRAY ARRAY[
    'nome', 'slug', 'descricao', 'preco',
    'preco_promocional', 'categoria_id', 'marca_id',
    'destaque', 'ativo', 'descricao_detalhada',
    'inspiracao', 'caracteristicas', 'composicao',
    'cuidados', 'tipo_modelagem', 'tamanho_modelo',
    'altura_modelo_cm', 'medidas_modelo',
    'observacoes_adicionais', 'tipo_guia_medidas'
  ] LOOP
    IF NOT (v_fields ? v_key) THEN
      RAISE EXCEPTION 'Campo obrigatório no payload: %', v_key;
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM jsonb_object_keys(v_fields) AS field(key)
    WHERE field.key NOT IN (
      'nome', 'slug', 'descricao', 'preco',
      'preco_promocional', 'categoria_id', 'marca_id',
      'destaque', 'ativo', 'descricao_detalhada',
      'inspiracao', 'caracteristicas', 'composicao',
      'cuidados', 'tipo_modelagem', 'tamanho_modelo',
      'altura_modelo_cm', 'medidas_modelo',
      'observacoes_adicionais', 'tipo_guia_medidas'
    )
  ) THEN
    RAISE EXCEPTION 'Campo não autorizado no payload';
  END IF;

  v_desired := jsonb_populate_record(
    NULL::public.produtos,
    v_fields
  );

  IF v_desired.nome IS NULL
     OR btrim(v_desired.nome) = ''
     OR v_desired.slug IS NULL
     OR v_desired.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     OR v_desired.categoria_id IS NULL
     OR v_desired.marca_id IS NULL
     OR v_desired.preco IS NULL
     OR v_desired.preco <= 0
     OR v_desired.ativo IS NULL
     OR v_desired.destaque IS NULL THEN
    RAISE EXCEPTION 'Dados principais do produto inválidos';
  END IF;

  IF v_desired.preco_promocional IS NOT NULL
     AND (
       v_desired.preco_promocional < 0
       OR v_desired.preco_promocional >= v_desired.preco
     ) THEN
    RAISE EXCEPTION 'Preço promocional inválido';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.categorias
    WHERE id = v_desired.categoria_id AND ativo = true
  ) OR NOT EXISTS (
    SELECT 1 FROM public.marcas
    WHERE id = v_desired.marca_id AND ativo = true
  ) THEN
    RAISE EXCEPTION 'Categoria ou marca inexistente/inativa';
  END IF;

  -- Bloqueio da linha e verificação de concorrência.
  SELECT *
  INTO v_product
  FROM public.produtos
  WHERE slug = v_desired.slug
  FOR UPDATE;

  v_exists := FOUND;

  IF v_exists THEN
    IF p_expected_id IS NULL
       OR p_expected_updated_at IS NULL
       OR p_expected_price IS NULL
       OR p_expected_id <> v_product.id
       OR p_expected_updated_at <> v_product.atualizado_em
       OR p_expected_price <> v_product.preco THEN
      RAISE EXCEPTION
        'Produto alterado desde a leitura. Refaça o planejamento.';
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM jsonb_each(v_fields) AS field(key, value)
      WHERE (to_jsonb(v_product)->field.key)
            IS DISTINCT FROM field.value
    )
    INTO v_changed;

    IF v_changed THEN
      UPDATE public.produtos
      SET
        nome = v_desired.nome,
        descricao = v_desired.descricao,
        preco = v_desired.preco,
        preco_promocional = v_desired.preco_promocional,
        categoria_id = v_desired.categoria_id,
        marca_id = v_desired.marca_id,
        destaque = v_desired.destaque,
        ativo = v_desired.ativo,
        descricao_detalhada = v_desired.descricao_detalhada,
        inspiracao = v_desired.inspiracao,
        caracteristicas = v_desired.caracteristicas,
        composicao = v_desired.composicao,
        cuidados = v_desired.cuidados,
        tipo_modelagem = v_desired.tipo_modelagem,
        tamanho_modelo = v_desired.tamanho_modelo,
        altura_modelo_cm = v_desired.altura_modelo_cm,
        medidas_modelo = v_desired.medidas_modelo,
        observacoes_adicionais = v_desired.observacoes_adicionais,
        tipo_guia_medidas = v_desired.tipo_guia_medidas,
        atualizado_em = now()
      WHERE id = v_product.id
      RETURNING * INTO v_product;
    END IF;
  ELSE
    IF p_expected_id IS NOT NULL
       OR p_expected_updated_at IS NOT NULL
       OR p_expected_price IS NOT NULL THEN
      RAISE EXCEPTION
        'Produto esperado não encontrado. Operação cancelada.';
    END IF;

    INSERT INTO public.produtos (
      nome, slug, descricao, preco, preco_promocional,
      categoria_id, marca_id, destaque, ativo,
      descricao_detalhada, inspiracao, caracteristicas,
      composicao, cuidados, tipo_modelagem, tamanho_modelo,
      altura_modelo_cm, medidas_modelo,
      observacoes_adicionais, tipo_guia_medidas
    )
    VALUES (
      v_desired.nome, v_desired.slug,
      v_desired.descricao, v_desired.preco,
      v_desired.preco_promocional, v_desired.categoria_id,
      v_desired.marca_id, v_desired.destaque,
      v_desired.ativo, v_desired.descricao_detalhada,
      v_desired.inspiracao, v_desired.caracteristicas,
      v_desired.composicao, v_desired.cuidados,
      v_desired.tipo_modelagem, v_desired.tamanho_modelo,
      v_desired.altura_modelo_cm,
      v_desired.medidas_modelo,
      v_desired.observacoes_adicionais,
      v_desired.tipo_guia_medidas
    )
    RETURNING * INTO v_product;

    v_created := true;
  END IF;

  -- Imagens: somente acrescentar URLs novas.
  FOR v_item IN
    SELECT value FROM jsonb_array_elements(v_images)
  LOOP
    v_image_url := v_item->>'url';

    IF v_image_url IS NULL
       OR v_image_url NOT LIKE
         'https://cdn.sanity.io/images/esjkriae/development/%'
       OR nullif(btrim(v_item->>'alt_text'), '') IS NULL
       OR COALESCE((v_item->>'ordem')::bigint, 0) < 1 THEN
      RAISE EXCEPTION 'Imagem inválida';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.imagens_produto
      WHERE produto_id = v_product.id
        AND url = v_image_url
    ) THEN
      CONTINUE;
    END IF;

    v_primary :=
      COALESCE((v_item->>'principal')::boolean, false);

    IF EXISTS (
      SELECT 1 FROM public.imagens_produto
      WHERE produto_id = v_product.id
        AND principal = true
    ) THEN
      v_primary := false;
    END IF;

    INSERT INTO public.imagens_produto (
      produto_id, url, alt_text, ordem,
      principal, cor_id
    )
    VALUES (
      v_product.id,
      v_image_url,
      v_item->>'alt_text',
      (v_item->>'ordem')::bigint,
      v_primary,
      (v_item->>'cor_id')::uuid
    );

    v_images_added := v_images_added + 1;
  END LOOP;

  -- Variações: nunca substituir nem zerar estoque.
  FOR v_item IN
    SELECT value FROM jsonb_array_elements(v_variants)
  LOOP
    v_sku := nullif(btrim(v_item->>'sku'), '');
    v_color_id := (v_item->>'cor_id')::uuid;
    v_size_id := (v_item->>'tamanho_id')::uuid;

    IF v_sku IS NULL
       OR v_color_id IS NULL
       OR v_size_id IS NULL THEN
      RAISE EXCEPTION 'SKU, cor ou tamanho inválido';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.cores
      WHERE id = v_color_id AND ativo = true
    ) OR NOT EXISTS (
      SELECT 1 FROM public.tamanhos
      WHERE id = v_size_id AND ativo = true
    ) THEN
      RAISE EXCEPTION 'Cor ou tamanho inexistente/inativo: %', v_sku;
    END IF;

    SELECT *
    INTO v_variant
    FROM public.variacoes_produto
    WHERE sku = v_sku
    FOR UPDATE;

    IF FOUND THEN
      IF v_variant.produto_id <> v_product.id
         OR v_variant.cor_id <> v_color_id
         OR v_variant.tamanho_id <> v_size_id THEN
        RAISE EXCEPTION 'Conflito de SKU: %', v_sku;
      END IF;

      CONTINUE;
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.variacoes_produto
      WHERE produto_id = v_product.id
        AND cor_id = v_color_id
        AND tamanho_id = v_size_id
    ) THEN
      RAISE EXCEPTION
        'Combinação de cor e tamanho já cadastrada: %', v_sku;
    END IF;

    INSERT INTO public.variacoes_produto (
      produto_id, sku, cor_id, tamanho_id,
      estoque, ativo
    )
    VALUES (
      v_product.id, v_sku, v_color_id, v_size_id,
      0, COALESCE((v_item->>'ativo')::boolean, true)
    );

    v_variants_added := v_variants_added + 1;
  END LOOP;

  -- Tags: criar e associar; não remover existentes.
  FOR v_item IN
    SELECT value FROM jsonb_array_elements(v_tags)
  LOOP
    IF nullif(btrim(v_item->>'nome'), '') IS NULL
       OR (v_item->>'slug') !~
          '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
      RAISE EXCEPTION 'Tag inválida';
    END IF;

    INSERT INTO public.tags (nome, slug)
    VALUES (v_item->>'nome', v_item->>'slug')
    ON CONFLICT (slug) DO NOTHING;

    SELECT id INTO v_tag_id
    FROM public.tags
    WHERE slug = v_item->>'slug';

    IF NOT EXISTS (
      SELECT 1 FROM public.produto_tag
      WHERE produto_id = v_product.id
        AND tag_id = v_tag_id
    ) THEN
      INSERT INTO public.produto_tag (produto_id, tag_id)
      VALUES (v_product.id, v_tag_id);

      v_tags_linked := v_tags_linked + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'product_id', v_product.id,
    'slug', v_product.slug,
    'created', v_created,
    'updated', v_changed,
    'price', v_product.preco,
    'images_added', v_images_added,
    'variants_added', v_variants_added,
    'tags_linked', v_tags_linked
  );
END;
$$;

-- Não permitir RPC público.
REVOKE ALL ON FUNCTION
  public.sync_catalog_product_dev(
    jsonb, uuid, numeric, timestamptz
  )
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.sync_catalog_product_dev(
    jsonb, uuid, numeric, timestamptz
  )
TO service_role;
