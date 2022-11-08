const { launches } = require('../models/launches')
const { planets } = require('../models/planets')

// pagination logic
const { getPagination } = require('../utils/query')

exports.getAllLaunches = async (req, res) => {

    const { limit, skip } = getPagination(req.query)

    try {
        const allLaunches = await launches.find({}, { _id: 0, __v: 0 })
                                        .sort({ flightNumber: 1 })
                                        .skip(skip)
                                        .limit(limit)
                                        
        return res.json(allLaunches)
    } catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Internal Server Error'})
    }
}

exports.addLaunch = async (req, res) => {
    try {
        let launch = req.body
        if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.destination){
            return res.status(400).json({ error: 'Missing required launch property' })
        } 
    
        launch.launchDate = new Date(launch.launchDate)
        if(isNaN(launch.launchDate)){
            return res.status(400).json({
                error: 'Invalid launch date',
            })
        }

        // check if destination planet actually exists
        const planet = await planets.findOne({ keplerName: launch.destination })

        if(!planet){
            return res.status(400).json({
                error: 'Invalid destination'
            })
        }

        const latestLaunch = await launches.findOne().sort('-flightNumber')
        let latestFlightNumber = latestLaunch ? ++latestLaunch.flightNumber : 100
        
        const newLaunch = await launches.findOneAndUpdate({
            flightNumber: launch.flightNumber,
        }, { 
            ...launch, 
            flightNumber: latestFlightNumber,
            customers: ['Zero To Mastery', 'NASA'],
        }, { 
            upsert: true,
            new: true,
        })
        return res.status(201).json(newLaunch)

    } catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}

/*
exports.httpAddNewLaunch = (req, res) => {
    let launch = req.body

    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.destination){
        return res.status(400).json({ error: 'Missing required launch property' })
    } 

    launch.launchDate = new Date(launch.launchDate)
    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error: 'Invalid launch date',
        })
    }
    addNewLaunch(launch)
    return res.status(201).json(launch)

}
*/

exports.abortLaunch = async (req, res) => {
    try {
        const { id } = req.params
        // check if launch exists
        const launch = await launches.findOne({ flightNumber: id })
        if(!launch){
            return res.status(404).json({
                error: 'Launch not found'
            })
        }
        
        const abortedLaunch = await launches.findOneAndUpdate({ 
            flightNumber: id 
        }, { 
            upcoming: false, 
            success: false 
        }, { 
            new: true 
        })
        return res.status(200).json(abortedLaunch)

    } catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}

/*
exports.httpAbortLaunch = (req, res) => {
    const id = Number(req.params.id)
    if(!existsLaunchWithId(id)){
        return res.status(404).json({
            error: 'Launch not found',
        })
    }

    const aborted = abortLaunchById(id)

    return res.json(aborted)
}
*/