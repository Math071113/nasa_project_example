const mongoose = require('mongoose')
const axios = require('axios')

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
    },
    mission: {
        type: String,
        required: true,
    },
    rocket:{
        type: String,
        required: true,
    },
    launchDate: {
        type: Date,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    customers: [String],
    upcoming: {
        type: Boolean,
        required: true,
        default: true,
    },
    success: {
        type: Boolean,
        required: true,
        default: true,
    },
})

// Connexts launchesSchema with "launches" collection
// Compiling the schema
const launches = mongoose.model('Launch', launchesSchema)

async function findLaunch(filter){
    return await launches.findOne(filter)
}

async function loadLaunchData(){
    const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

    // check if SpaceX launches have already been downloaded to DB
    const firstSpacexLaunch = await findLaunch({ 
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
     })

     if(firstSpacexLaunch) {
        console.log('Launch data already loaded')
        return
     }

    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1,
                    },
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1,
                    }
                }
            ]
        }
    })

    const launchDocs = response.data.docs
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap(i => {
            return i['customers'] 
        })

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            destination: 'not applicable',
            customers,
        }

        const newLaunch = await launches.create(launch)
        await newLaunch.save()
    }
}

module.exports = {
    launches,
    loadLaunchData,
}

/*
const launches = new Map()

let latestFlightNumber = 100

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    destination: 'Kepler-442 b',
    customer: ['NASA', 'ZTM'],
    upcoming: true,
    success: true,
}

launches.set(launch.flightNumber, launch)

function getAllLaunches(){
    return Array.from(launches.values())
}

function addNewLaunch(launch){
    latestFlightNumber++
    launches.set(launch.flightNumber, Object.assign(launch, {
        flightNumber: latestFlightNumber,
        customer: ['ZTM', 'NASA'],
        upcoming: true,
        success: true,
    }))
}

function existsLaunchWithId(id){
    return launches.has(Number(id))
}

function abortLaunchById(id){
    const aborted = launches.get(id)
    aborted.upcoming = false
    aborted.success = false
    return aborted
}

module.exports = {
    getAllLaunches,
    addNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
}
*/