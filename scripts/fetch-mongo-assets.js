#!/usr/bin/env node

/**
 * One-off helper to mirror seeded Mongo media files into /public.
 * Usage: node scripts/fetch-mongo-assets.js "{\"root\":\"mongodb://...\"}" --dest public/images/uploads
 */

const fs = require('node:fs')
const path = require('node:path')
const { MongoClient } = require('mongodb')

async function main() {
  const [connectionJson, ...rest] = process.argv.slice(2)
  if (!connectionJson) {
    console.error('Usage: node scripts/fetch-mongo-assets.js "{\"uri\":\"mongodb://...\",\"db\":\"glowglitch\"}"')
    process.exit(1)
  }

  const opts = JSON.parse(connectionJson)
  const destDir = rest[0] ?? path.join(process.cwd(), 'public', 'images', 'uploads')

  if (!opts.uri) {
    console.error('Missing `uri` in connection JSON payload')
    process.exit(1)
  }

  const client = new MongoClient(opts.uri)
  await client.connect()
  const db = client.db(opts.db ?? 'glowglitch')
  const bucket = new (require('mongodb')).GridFSBucket(db, {
    bucketName: opts.bucket ?? 'assets'
  })

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  const files = await db.collection(`${bucket.s.options.bucketName}.files`).find({}).toArray()

  for (const file of files) {
    const filePath = path.join(destDir, file.filename)
    const stream = bucket.openDownloadStream(file._id)
    await streamToFile(stream, filePath)
    console.log(`Saved ${file.filename} → ${filePath}`)
  }

  await client.close()
}

async function streamToFile(readable, filePath) {
  await new Promise((resolve, reject) => {
    const write = fs.createWriteStream(filePath)
    readable.pipe(write)
    readable.on('error', reject)
    write.on('error', reject)
    write.on('finish', resolve)
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
