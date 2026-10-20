import {defineArrayMember, defineField, defineType} from 'sanity'

const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const detailFields = [
    ['descricaoDetalhada', 'Descrição detalhada'],
    ['inspiracao', 'Inspiração'],
    ['composicao', 'Composição'],
    ['cuidados', 'Cuidados de conservação'],
    ['tipoModelagem', 'Tipo de modelagem'],
    ['tamanhoModelo', 'Tamanho utilizado pelo modelo'],
    ['medidasModelo', 'Medidas do modelo'],
    ['observacoesAdicionais', 'Observações adicionais'],
    ['tipoGuiaMedidas', 'Tipo de guia de medidas'],
]

export const product = defineType({
    name: 'product',
    title: 'Produto',
    type: 'document',

    fields: [
        defineField({
            name: 'nome',
            title: 'Nome',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {source: 'nome'},
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'categoriaSlug',
            title: 'Slug da categoria',
            description: 'Utilize o slug oficial do catálogo Supabase.',
            type: 'string',
            validation: (rule) => rule.required().regex(validSlug),
        }),
        defineField({
            name: 'marcaSlug',
            title: 'Slug da marca',
            type: 'string',
            initialValue: 'chouga',
            validation: (rule) => rule.required().regex(validSlug),
        }),
        defineField({
            name: 'descricao',
            title: 'Descrição resumida',
            type: 'text',
            rows: 4,
        }),
        defineField({
            name: 'preco',
            title: 'Preço (R$)',
            type: 'number',
            validation: (rule) => rule.required().greaterThan(0),
        }),
        defineField({
            name: 'precoPromocional',
            title: 'Preço promocional (R$)',
            type: 'number',
            validation: (rule) => rule.min(0),
        }),
        defineField({
            name: 'ativo',
            title: 'Ativo no catálogo',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'destaque',
            title: 'Produto em destaque',
            type: 'boolean',
            initialValue: false,
        }),

        ...detailFields.map(([name, title]) => defineField({name, title, type: 'text'})),

        defineField({
            name: 'caracteristicas',
            title: 'Características',
            type: 'array',
            of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
            name: 'alturaModeloCm',
            title: 'Altura do modelo (cm)',
            type: 'number',
            validation: (rule) => rule.integer().min(0),
        }),

        defineField({
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'nome',
                            title: 'Nome',
                            type: 'string',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'slug',
                            title: 'Slug',
                            type: 'string',
                            validation: (rule) => rule.required().regex(validSlug),
                        }),
                    ],
                    preview: {
                        select: {title: 'nome', subtitle: 'slug'},
                    },
                }),
            ],
        }),

        defineField({
            name: 'imagens',
            title: 'Fotografias',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'image',
                    options: {hotspot: true},
                    fields: [
                        defineField({
                            name: 'alt',
                            title: 'Texto alternativo',
                            type: 'string',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'cor',
                            title: 'Nome da cor',
                            type: 'string',
                        }),
                        defineField({
                            name: 'corSlug',
                            title: 'Slug da cor',
                            description: 'Exemplo: branco',
                            type: 'string',
                        }),
                        defineField({
                            name: 'principal',
                            title: 'Imagem principal',
                            type: 'boolean',
                            initialValue: false,
                        }),
                    ],
                }),
            ],
        }),

        defineField({
            name: 'variacoes',
            title: 'Variações disponíveis',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'sku',
                            title: 'SKU',
                            type: 'string',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'cor',
                            title: 'Cor',
                            type: 'string',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'corSlug',
                            title: 'Slug da cor',
                            type: 'string',
                        }),
                        defineField({
                            name: 'tamanho',
                            title: 'Tamanho',
                            type: 'string',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'tamanhoSlug',
                            title: 'Slug do tamanho',
                            type: 'string',
                        }),
                        defineField({
                            name: 'ativo',
                            title: 'Variação ativa',
                            type: 'boolean',
                            initialValue: true,
                        }),
                    ],
                    preview: {
                        select: {
                            title: 'sku',
                            cor: 'cor',
                            tamanho: 'tamanho',
                        },
                        prepare({title, cor, tamanho}) {
                            return {
                                title,
                                subtitle: `${cor || ''} / ${tamanho || ''}`,
                            }
                        },
                    },
                }),
            ],
        }),
    ],

    preview: {
        select: {
            title: 'nome',
            price: 'preco',
            media: 'imagens.0',
        },
        prepare({title, price, media}) {
            return {
                title,
                subtitle: price == null ? 'Preço não informado' : `R$ ${price.toFixed(2)}`,
                media,
            }
        },
    },
})
