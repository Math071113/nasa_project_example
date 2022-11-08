// Reusable way to get any endpoint paginated

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 0 // Mongo returns all documents in a collection

function getPagination(query){
    const limit = Math.abs(query.limit) || DEFAULT_LIMIT
    const page = Math.abs(query.page) || DEFAULT_PAGE

    const skip = (page - 1) * limit

    return {
        skip,
        limit,
    }
}

module.exports = {
    getPagination,
}