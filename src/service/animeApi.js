
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
        startDate: attr.startDate || 'N/A',
        endDate: attr.endDate || 'N/A',
        episodes: attr.episodeCount || '?',
        type: attr.subtype ? attr.subtype.toUpperCase() : 'TV',
        synopsis: attr.synopsis || 'Sin descripción disponible.',

        // Atributos extendidos para la vista de detalle:
        youtubeVideoId: attr.youtubeVideoId || null,
        coverImage: attr.coverImage?.large || attr.coverImage?.original || null,
        ageRating: attr.ageRatingGuide || attr.ageRating || 'N/A',
        popularityRank: attr.popularityRank || 'N/A',
        ratingRank: attr.ratingRank || 'N/A',
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

/**
 * Convierte el formato de respuesta de un personaje en Kitsu 
 * al formato unificado de la aplicación.
 */
const mapearPersonaje = (char) => {
    const attr = char.attributes || {}
    return {
        id: char.id,
        mal_id: char.id, // Compatibilidad con v-for keys
        name: attr.name || attr.canonicalName || 'Personaje Desconocido',
        otherNames: attr.otherNames || [],
        image: attr.image?.original || attr.image?.medium || attr.image?.large || '',
        synopsis: attr.description || attr.synopsis || 'Sin biografía disponible.',
        description: attr.description || attr.synopsis || 'Sin biografía disponible.'
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
// 5. Obtener detalle de un anime por ID
export const getAnimeById = async (id) => {
    try {
        // Incluimos la relación con categorías en la llamada individual
        const res = await fetch(`${BASE_URL}/anime/${id}?include=categories`)
        if (!res.ok) {
            if (res.status === 404) throw new Error('El anime solicitado no existe')
            throw new Error(`Error ${res.status}: No se pudo obtener el detalle del anime`)
        }
        const data = await res.json()
        // Kitsu devuelve un objeto con { data, included }
        return mapearAnime({
            ...data.data,
            included: data.included
        })
    } catch (err) {
        console.error(`Error Kitsu API (getAnimeById:${id}):`, err)
        throw err
    }
}

/**
 * 6. Obtiene la lista de personajes populares/destacados
 */
export const getPersonajesPopulares = async (page = 1) => {
    try {
        const offset = (page - 1) * LIMITE
        // Eliminamos 'sort=-mediaCount' para evitar el Error 400
        const url = `${BASE_URL}/characters?page[limit]=${LIMITE}&page[offset]=${offset}`

        const res = await fetch(url)
        if (!res.ok) throw new Error(`Error ${res.status}: No se pudieron obtener los personajes`)

        const data = await res.json()
        const totalRegistros = data.meta?.count || 0
        const totalPaginas = Math.ceil(totalRegistros / LIMITE)

        return {
            data: (data.data || []).map(mapearPersonaje),
            pagination: {
                last_visible_page: Math.min(totalPaginas, 100)
            }
        }
    } catch (err) {
        console.error('Error Kitsu API (getPersonajesPopulares):', err)
        throw err
    }
}

/**
 * 7. Busca personajes por nombre
 */
export const buscarPersonajePorTexto = async (query, page = 1) => {
    try {
        const offset = (page - 1) * LIMITE
        const url = `${BASE_URL}/characters?filter[name]=${encodeURIComponent(query)}&page[limit]=${LIMITE}&page[offset]=${offset}`

        const res = await fetch(url)
        if (!res.ok) throw new Error(`Error ${res.status}: Fallo en la búsqueda de personaje`)

        const data = await res.json()
        const totalRegistros = data.meta?.count || 0
        const totalPaginas = Math.ceil(totalRegistros / LIMITE)

        return {
            data: (data.data || []).map(mapearPersonaje),
            pagination: {
                last_visible_page: Math.min(totalPaginas, 100)
            }
        }
    } catch (err) {
        console.error('Error Kitsu API (buscarPersonajePorTexto):', err)
        throw err
    }
}

/**
 * 8. Obtiene el detalle individual de un personaje por ID
 */
export const getPersonajeById = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/characters/${id}`)
        if (!res.ok) {
            if (res.status === 404) throw new Error('El personaje solicitado no existe')
            throw new Error(`Error ${res.status}: No se pudo obtener el detalle del personaje`)
        }
        const data = await res.json()
        return mapearPersonaje(data.data)
    } catch (err) {
        console.error(`Error Kitsu API (getPersonajeById:${id}):`, err)
        throw err
    }
}
