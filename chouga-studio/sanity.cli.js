import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'esjkriae',
    dataset: 'production',
  },
  deployment: {
    appId: 'td4n340xhad6tafpml0v97qg',
    autoUpdates: true,
  },
})
