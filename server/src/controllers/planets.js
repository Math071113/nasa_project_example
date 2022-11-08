const { planets } = require('../models/planets')

exports.getAllPlanets = async (req, res) => {
    try {
        const allPlanets = await planets.find({}, {
            _id: 0,
            __v: 0,
        })
        return res.json(allPlanets)
    } catch(err){
        console.log(err)
    }
}