import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
    name: 'default',
    title: `Chouga CMS (${process.env.SANITY_STUDIO_DATASET || 'production'})`,

    projectId: 'esjkriae',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',

    plugins: [structureTool(), visionTool()],

    schema: {
        types: schemaTypes,
    },
})
