import {CalendarIcon} from '@sanity/icons/Calendar'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Evento',
  type: 'document',
  icon: CalendarIcon,

  groups: [
    {
      name: 'content',
      title: 'Conteúdo',
      default: true,
    },
    {
      name: 'schedule',
      title: 'Data e horário',
    },
    {
      name: 'location',
      title: 'Local',
    },
    {
      name: 'media',
      title: 'Mídia e links',
    },
  ],

  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(120),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'summary',
      title: 'Resumo',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Texto curto utilizado nos cards da agenda.',
      validation: (rule) => [
        rule.required(),
        rule.max(220).warning('Prefira um resumo com até 220 caracteres.'),
      ],
    }),

    defineField({
      name: 'description',
      title: 'Descrição',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
        }),
      ],
    }),

    defineField({
      name: 'eventStatus',
      title: 'Situação do evento',
      type: 'string',
      group: 'content',
      initialValue: 'scheduled',
      options: {
        layout: 'radio',
        list: [
          {
            title: 'Confirmado',
            value: 'scheduled',
          },
          {
            title: 'Adiado',
            value: 'postponed',
          },
          {
            title: 'Cancelado',
            value: 'cancelled',
          },
        ],
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'prominence',
      title: 'Destaque',
      type: 'string',
      group: 'content',
      initialValue: 'standard',
      options: {
        layout: 'radio',
        list: [
          {
            title: 'Padrão',
            value: 'standard',
          },
          {
            title: 'Evento em destaque',
            value: 'featured',
          },
        ],
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'startDate',
      title: 'Início',
      type: 'datetime',
      group: 'schedule',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'endDate',
      title: 'Término',
      type: 'datetime',
      group: 'schedule',
      validation: (rule) =>
        rule.required().custom((endDate, context) => {
          const startDate = context.document?.startDate

          if (!startDate || !endDate) {
            return true
          }

          return (
            new Date(endDate) > new Date(startDate) || 'O término deve acontecer depois do início.'
          )
        }),
    }),

    defineField({
      name: 'timezone',
      title: 'Fuso horário',
      type: 'string',
      group: 'schedule',
      initialValue: 'America/Sao_Paulo',
      description: 'Utilize um identificador IANA, como America/Sao_Paulo.',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'location',
      title: 'Local',
      type: 'object',
      group: 'location',
      fields: [
        defineField({
          name: 'venue',
          title: 'Nome do local',
          type: 'string',
          validation: (rule) => rule.required(),
        }),

        defineField({
          name: 'address',
          title: 'Endereço',
          type: 'string',
        }),

        defineField({
          name: 'city',
          title: 'Cidade',
          type: 'string',
          validation: (rule) => rule.required(),
        }),

        defineField({
          name: 'state',
          title: 'Estado',
          type: 'string',
          validation: (rule) => rule.max(2),
        }),

        defineField({
          name: 'mapsUrl',
          title: 'Link do mapa',
          type: 'url',
          validation: (rule) =>
            rule.uri({
              scheme: ['http', 'https'],
            }),
        }),
      ],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'image',
      title: 'Imagem',
      type: 'image',
      group: 'media',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description: 'Descreva a imagem para acessibilidade.',
          validation: (rule) => rule.required(),
        }),
      ],
    }),

    defineField({
      name: 'externalUrl',
      title: 'Link externo',
      type: 'url',
      group: 'media',
      description: 'Página de inscrição, regulamento ou mais informações.',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
  ],

  orderings: [
    {
      title: 'Data do evento',
      name: 'startDateAscending',
      by: [
        {
          field: 'startDate',
          direction: 'asc',
        },
      ],
    },
  ],

  preview: {
    select: {
      title: 'title',
      startDate: 'startDate',
      venue: 'location.venue',
      media: 'image',
    },
    prepare({title, startDate, venue, media}) {
      const formattedDate = startDate
        ? new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(startDate))
        : 'Data não definida'

      return {
        title,
        subtitle: `${formattedDate} · ${venue || 'Local não definido'}`,
        media,
      }
    },
  },
})
