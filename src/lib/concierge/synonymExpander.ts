/**
 * Synonym Expander for Product Search
 * Expands search queries with synonyms for better matching
 */

import synonymsData from '../../../config/synonyms.json'

export interface SynonymMap {
  categories: Record<string, string[]>
  metals: Record<string, string[]>
  styles: Record<string, string[]>
  occasions: Record<string, string[]>
  features: Record<string, string[]>
}

const synonyms = synonymsData as SynonymMap

/**
 * Expand a search query with synonyms
 * Returns an array of terms that should be OR-matched in the database
 * 
 * @param query - The original search query
 * @returns Array of terms to match (including original query)
 */
export function expandWithSynonyms(query: string): string[] {
  if (!query || typeof query !== 'string') {
    return []
  }

  const normalized = query.toLowerCase().trim()
  const terms = new Set<string>([normalized]) // Always include original

  // Flatten all synonyms into a searchable structure
  const allMappings: Array<{ canonical: string; synonyms: string[] }> = []
  
  Object.entries(synonyms).forEach(([_category, mapping]) => {
    Object.entries(mapping).forEach(([canonical, syns]) => {
      if (Array.isArray(syns)) {
        allMappings.push({ canonical, synonyms: syns as string[] })
      }
    })
  })

  // For each mapping, check if query matches canonical or any synonym
  allMappings.forEach(({ canonical, synonyms: syns }) => {
    const allTerms = [canonical, ...syns].map(t => t.toLowerCase())
    
    // If query matches any term in this group, add the canonical term
    if (allTerms.some(term => normalized.includes(term) || term.includes(normalized))) {
      terms.add(canonical)
      // Also add all synonyms for comprehensive matching
      syns.forEach(syn => terms.add(syn.toLowerCase()))
    }
  })

  return Array.from(terms)
}

/**
 * Expand a query into MongoDB regex patterns for OR matching
 * 
 * @param query - The original search query
 * @returns Array of RegExp objects for MongoDB $or queries
 */
export function expandToRegexPatterns(query: string): RegExp[] {
  const terms = expandWithSynonyms(query)
  return terms.map(term => {
    // Escape special regex characters
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(escaped, 'i')
  })
}

/**
 * Get canonical term for a given query
 * Useful for consistent tagging and categorization
 * 
 * @param query - The search query
 * @returns Canonical term or original query if no match
 */
export function getCanonicalTerm(query: string): string {
  const normalized = query.toLowerCase().trim()
  
  for (const mapping of Object.values(synonyms)) {
    for (const [canonical, syns] of Object.entries(mapping)) {
      if (Array.isArray(syns)) {
        const allTerms = [canonical, ...(syns as string[])].map(t => t.toLowerCase())
        if (allTerms.includes(normalized)) {
          return canonical
        }
      }
    }
  }
  
  return query
}

