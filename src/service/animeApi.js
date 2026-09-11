
const BASE_URL = 'https://kitsu.io/api/edge'
const LIMITE = 10

/**
 * Convierte el formato de respuesta de Kitsu al formato unificado
 * que ya usan tus componentes Vue.
 */
const mapearAnime = (anime) => {
    const attr = anime.attributes || {}

    // Kitsu maneja puntuación en escala de 0 a 100 (ej. "84.25") -> lo pasamos a escala 0-10 (8.4)
    const scoreBase10 = attr.averageRating
        ? (parseFloat(attr.averageRating) / 10).toFixed(1)
        : 'N/A'

    // Mapear categorías si vienen incluidas en la petición
    const genres = (anime.included || [])
        .filter(inc => inc.type === 'categories')
        .map(c => ({ mal_id: c.id, name: c.attributes?.title }))

    return {
        id: anime.id,
        mal_id: anime.id, // Compatibilidad con las keys en v-for
        title: attr.canonicalTitle || attr.titles?.en || attr.titles?.ja_jp || 'Sin título',
        score: scoreBase10,
        status: attr.status === 'current' ? 'En emisión' : (attr.status || 'Finalizado'),
        year: attr.startDate ? attr.startDate.substring(0, 4) : 'N/A',
        episodes: attr.episodeCount || '?',
        type: attr.subtype ? attr.subtype.toUpperCase() : 'TV',
        synopsis: attr.synopsis || 'Sin descripción disponible.',
        images: {
            jpg: {
                large_image_url: attr.posterImage?.large || attr.posterImage?.medium || attr.posterImage?.original || '',
                image_url: attr.posterImage?.small || attr.posterImage?.tiny || ''
            }
        },
        genres: genres
    }
}

/**
 * Petición genérica con manejo de offsets de Kitsu
 */
const fetchKitsu = async (endpointWithParams, page = 1) => {
    try {
        const offset = (page - 1) * LIMITE
        const urlConPaginacion = `${BASE_URL}/${endpointWithParams}&page[limit]=${LIMITE}&page[offset]=${offset}`

        const res = await fetch(urlConPaginacion)
        if (!res.ok) throw new Error(`Error ${res.status}: No se pudo conectar con Kitsu`)

        const data = await res.json()
        const totalRegistros = data.meta?.count || 0
        const totalPaginas = Math.ceil(totalRegistros / LIMITE)

        return {
            data: (data.data || []).map(item => mapearAnime(item)),
            pagination: {
                last_visible_page: Math.min(totalPaginas, 100) // Limitamos a 100 páginas máx.
            }
        }
    } catch (err) {
        console.error('Error Kitsu API:', err)
        throw err
    }
}

// 1. Obtenemos animes en emisión / novedades
export const getAnimesRecientes = (page = 1) => {
    return fetchKitsu('anime?filter[status]=current&sort=-userCount', page)
}

// 2. Búsqueda de animes por palabra clave
export const buscarAnimePorTexto = (query, page = 1) => {
    return fetchKitsu(`anime?filter[text]=${encodeURIComponent(query)}`, page)
}

// 3. Filtro de animes por categoría/género
export const buscarAnimePorCategoria = (categoria, page = 1) => {
    return fetchKitsu(`anime?filter[categories]=${encodeURIComponent(categoria.toLowerCase())}`, page)
}

// 4. Animes más populares / top (para el Home)
export const getAnimesPopulares = (page = 1) => {
    return fetchKitsu('anime?sort=-userCount', page)
}