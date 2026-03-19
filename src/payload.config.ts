import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { Users } from './collections/Users'
import { Diagnostics } from './collections/Diagnostics'
import { Reports } from './collections/Reports'
import { Reviews } from './collections/Reviews'
import { Referrals } from './collections/Referrals'
import { RetraitiaFlash } from './collections/RetraitiaFlash'
import { RetraitiaDossiers } from './collections/RetraitiaDossiers'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: { user: Users.slug, importMap: { baseDir: path.resolve(dirname) } },
  collections: [Users, Diagnostics, Reports, Reviews, Referrals, RetraitiaFlash, RetraitiaDossiers],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'CHANGE-ME',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({ url: process.env.MONGODB_URI || 'mongodb://localhost:27017/recupeo' }),
  sharp: undefined,
})
