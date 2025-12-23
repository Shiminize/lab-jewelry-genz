import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export type MemoryDoc = Record<string, any>
export type MemoryCollection = Map<string, MemoryDoc>

const MEMORY_DB_FILE = path.resolve(process.cwd(), '.next', 'cache', 'neon-memory-db.json')
const JSON_SEED_FILE = path.resolve(process.cwd(), 'seed_data', 'production_products.json')
const ACCENT_TONES = ['volt', 'cyan', 'magenta', 'lime']

const memoryStore = new Map<string, MemoryCollection>()

// --- Operators ---

const evaluateOperators = (actual: any, operators: Record<string, any>): boolean => {
    for (const [op, expected] of Object.entries(operators)) {
        switch (op) {
            case '$lt':
                if (!((actual ?? null) < expected)) return false
                break
            case '$lte':
                if (!((actual ?? null) <= expected)) return false
                break
            case '$gt':
                if (!((actual ?? null) > expected)) return false
                break
            case '$gte':
                if (!((actual ?? null) >= expected)) return false
                break
            case '$in':
                if (!Array.isArray(expected) || !expected.includes(actual)) return false
                break
            case '$exists': {
                const exists = actual !== undefined && actual !== null
                if (expected ? !exists : exists) return false
                break
            }
            case '$eq':
                if (actual !== expected) return false
                break
            default:
                return false
        }
    }
    return true
}

const matchesCondition = (doc: MemoryDoc, condition: Record<string, any>): boolean => {
    if (!condition || Object.keys(condition).length === 0) {
        return true
    }

    return Object.entries(condition).every(([key, value]) => {
        if (key === '_id') {
            return doc._id === value
        }
        if (key.includes('.')) {
            const [head, ...rest] = key.split('.')
            const nested = doc[head]
            if (nested && typeof nested === 'object') {
                return matchesCondition(nested, { [rest.join('.')]: value })
            }
            return false
        }

        const actual = doc[key]
        if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).some((op) => op.startsWith('$'))) {
            return evaluateOperators(actual, value as Record<string, any>)
        }

        return doc[key] === value
    })
}

// --- Helpers ---

function getNestedValue(doc: MemoryDoc, path: string) {
    return path.split('.').reduce((acc: any, key) => {
        if (acc && typeof acc === 'object' && key in acc) {
            return acc[key]
        }
        return undefined
    }, doc)
}

function sortDocs(docs: MemoryDoc[], sortSpec: Record<string, number>) {
    const entries = Object.entries(sortSpec ?? {})
    if (!entries.length) {
        return docs
    }

    return [...docs].sort((a, b) => {
        for (const [field, direction] of entries) {
            const dir = direction >= 0 ? 1 : -1
            const aValue = getNestedValue(a, field)
            const bValue = getNestedValue(b, field)
            if (aValue == null && bValue == null) continue
            if (aValue == null) return -1 * dir
            if (bValue == null) return 1 * dir

            const aComparable = aValue instanceof Date ? aValue.getTime() : aValue
            const bComparable = bValue instanceof Date ? bValue.getTime() : bValue

            if (aComparable > bComparable) return 1 * dir
            if (aComparable < bComparable) return -1 * dir
        }
        return 0
    })
}

// --- Persistence ---

function persistMemoryStoreToDisk() {
    try {
        const payload: Record<string, Record<string, MemoryDoc>> = {}
        memoryStore.forEach((collection, collectionName) => {
            payload[collectionName] = Object.fromEntries(Array.from(collection.entries()))
        })
        fs.mkdirSync(path.dirname(MEMORY_DB_FILE), { recursive: true })
        fs.writeFileSync(MEMORY_DB_FILE, JSON.stringify(payload, null, 2), 'utf8')
    } catch (error) {
        console.warn('Failed to persist memory DB snapshot', error)
    }
}

function loadMemoryStoreFromDisk() {
    try {
        if (!fs.existsSync(MEMORY_DB_FILE)) return
        const raw = fs.readFileSync(MEMORY_DB_FILE, 'utf8')
        const data = JSON.parse(raw) as Record<string, Record<string, MemoryDoc>>
        for (const [collectionName, docs] of Object.entries(data)) {
            const collection = new Map<string, MemoryDoc>()
            for (const [id, doc] of Object.entries(docs)) {
                collection.set(id, doc)
            }
            memoryStore.set(collectionName, collection)
        }
    } catch (error) {
        console.warn('Failed to load memory DB snapshot', error)
    }
}

// --- Seeding ---

function slugify(value: unknown, fallback: string) {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    return fallback
}

function buildSeedDocument(raw: any, index: number) {
    const fallbackSlug = `product-${index}`
    // Simplified regex-based slugify to match scripts/seed-products.js
    const slugValue = raw?.slug || raw?.name
    const slug = slugify(slugValue, fallbackSlug)
    const basePrice = raw?.pricing?.basePrice ?? raw?.basePrice ?? 0
    const materialsArray = raw.materials || []
    const gemstonesArray = raw.gemstones || []

    // Metadata construction matching production seed logic
    const metadata = {
        status: 'active',
        featured: index < 4,
        bestseller: false,
        collections: raw.metadata?.collections || [],
        accentTone: raw.metadata?.accentTone || ACCENT_TONES[index % ACCENT_TONES.length],
        tagline: raw.metadata?.tagline || raw.description?.slice(0, 50) || raw.name,
        readyToShip: true,
        limitedDrop: false,
        primaryMetal: raw.metadata?.primaryMetal,
        keyFeatures: [],
        customization: raw.metadata?.customization,
        ...raw.metadata // Allow overrides
    }

    if (!metadata.primaryMetal && materialsArray.length > 0) {
        metadata.primaryMetal = materialsArray[0].name
    }

    // Category normalization
    let categoryRaw = raw.category || 'Jewelry';
    let category = categoryRaw.toLowerCase();
    if (category.includes('earring')) category = 'earring';
    else if (category.includes('ring')) category = 'ring';
    else if (category.includes('necklace') || category.includes('pendant')) category = 'necklace';
    else if (category.includes('bracelet')) category = 'bracelet';

    // Description enhancement for search
    let description = raw.description || '';
    if (metadata.readyToShip) {
        description += ' Ready to Ship.';
    }
    if (raw.category) {
        description += ' ' + raw.category + '.';
    }

    return {
        _id: crypto.randomUUID(),
        name: raw.name,
        description,
        category,
        slug,
        seo: { slug },
        pricing: { basePrice },
        basePrice,
        sku: raw.sku,
        images: raw.images,
        media: {},
        materials: materialsArray,
        gemstones: gemstonesArray,
        inventory: {
            sku: raw.sku,
            quantity: 50,
            reserved: 0,
            available: 50,
            lowStockThreshold: 5,
            isCustomMade: false,
            leadTime: { min: 2, max: 5 },
            ...raw.inventory
        },
        metadata,
        readyToShip: metadata.readyToShip,
        featuredInWidget: metadata.featured || metadata.readyToShip || false,
        tags: (metadata.collections || []).map((c: string) => c.toLowerCase()),
        highlights: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        ...raw
    }
}

function ensureMemorySeeded() {
    try {
        const existingProducts = memoryStore.get('products')
        if (existingProducts && existingProducts.size > 0) return

        // Try script loader
        try {
            const seedMemoryDb = require('../../scripts/memory-db')
            if (typeof seedMemoryDb === 'function') {
                seedMemoryDb(memoryStore)
                persistMemoryStoreToDisk()
                return
            }
        } catch { }

        // Fallback to JSON
        if (fs.existsSync(JSON_SEED_FILE)) {
            const raw = fs.readFileSync(JSON_SEED_FILE, 'utf8')
            const parsed = JSON.parse(raw)
            const products = Array.isArray(parsed?.products) ? parsed.products : []

            const prodCollection = new Map<string, MemoryDoc>()
            products.forEach((p: any, i: number) => {
                const doc = buildSeedDocument(p, i)
                prodCollection.set(doc._id, doc)
            })
            memoryStore.set('products', prodCollection)
            persistMemoryStoreToDisk()
        }
    } catch (error) {
        console.warn('Failed to ensure memory DB seeded', error)
    }
}

// --- Core API ---

export const getMemoryCollection = (name: string) => {
    if (!memoryStore.has(name)) {
        memoryStore.set(name, new Map())
    }
    return memoryStore.get(name) as MemoryCollection
}

export const buildMemoryDb = () => {
    // Ensure loaded/seeded upon creation
    loadMemoryStoreFromDisk()
    ensureMemorySeeded()

    return {
        collection(name: string) {
            const collection = getMemoryCollection(name)

            return {
                async findOne(filter: Record<string, any> = {}) {
                    const docs = Array.from(collection.values())
                    if (filter?._id && collection.has(filter._id)) {
                        return collection.get(filter._id) ?? null
                    }
                    const match = docs.find((doc) => matchesCondition(doc, filter))
                    return match ?? null
                },

                find(filter: Record<string, any> = {}, options: Record<string, any> = {}) {
                    let docs = Array.from(collection.values()).filter((doc) => matchesCondition(doc, filter))
                    if (options.sort) {
                        docs = sortDocs(docs, options.sort)
                    }

                    let cursorLimit = typeof options.limit === 'number' ? options.limit : undefined

                    const cursor = {
                        sort(sortSpec: Record<string, number>) {
                            docs = sortDocs(docs, sortSpec)
                            return cursor
                        },
                        limit(limitCount?: number) {
                            cursorLimit = typeof limitCount === 'number' ? limitCount : cursorLimit
                            return cursor
                        },
                        async toArray() {
                            return typeof cursorLimit === 'number' ? docs.slice(0, cursorLimit) : docs
                        },
                    }
                    return cursor
                },

                async countDocuments(filter: Record<string, any> = {}) {
                    const docs = Array.from(collection.values()).filter((doc) => matchesCondition(doc, filter))
                    return docs.length
                },

                async insertOne(doc: MemoryDoc) {
                    if (!doc._id) {
                        doc._id = crypto.randomUUID()
                    }
                    collection.set(doc._id, doc)
                    persistMemoryStoreToDisk()
                    return { acknowledged: true, insertedId: doc._id }
                },

                async updateOne(filter: Record<string, any>, update: Record<string, any>) {
                    const doc = Array.from(collection.values()).find((d) => matchesCondition(d, filter))
                    if (!doc) {
                        return { matchedCount: 0, modifiedCount: 0, upsertedId: null }
                    }

                    if (update.$set) {
                        for (const [key, value] of Object.entries(update.$set)) {
                            if (key.includes('.')) {
                                const parts = key.split('.')
                                let target = doc
                                for (let i = 0; i < parts.length - 1; i++) {
                                    if (!target[parts[i]] || typeof target[parts[i]] !== 'object') {
                                        target[parts[i]] = {}
                                    }
                                    target = target[parts[i]]
                                }
                                target[parts[parts.length - 1]] = value
                            } else {
                                // @ts-ignore
                                doc[key] = value
                            }
                        }
                    }
                    // Handle other operators if needed, but $set is 90%

                    collection.set(doc._id, doc)
                    persistMemoryStoreToDisk()
                    return { matchedCount: 1, modifiedCount: 1, upsertedId: null }
                }
            }
        },
    }
}
