const mongoose = require('mongoose')
const { parse } = require('csv-parse')
const fs = require('fs')
const path = require('path')

const planetSchema = new mongoose.Schema({
    keplerName: {
        type: String,
        required: true,
    }
})

const planets = mongoose.model('Planet', planetSchema)

const isHabitablePlanet = planet => {
    return planet['koi_disposition']  ===  'CONFIRMED' 
    && planet['koi_insol'] > 0.36 
    && planet['koi_insol'] < 1.1
    && planet['koi_prad'] < 1.6
}

function loadPlanetsData(){
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
        // .pipe() links a readable stream (created by fs.createReadStream) to a writable stream (parse())
        .pipe(parse({
            comment: '#',
            columns: true, // returns each row as an object instead of an array
        }))
        // now data will be the parsed data
        .on('data', async data => {
            if(isHabitablePlanet(data)){
                // upsert = insert + update
                try {
                    await planets.updateOne({
                        keplerName: data.kepler_name,
                    }, { 
                        keplerName: data.kepler_name 
                    }, {
                        upsert: true,
                    })
                } catch(err){
                    console.error(`Could not save planet. ${err}`)
                }
            }
        })
        .on('error', (err) => {
            console.log(err)
            reject(err)
        })
        .on('end', async () => {
            const habitablePlanets = await planets.find()  
            console.log(`${habitablePlanets.length} habitable planets were found`)
            resolve()
        })

    })

}

function getAllPlanets(){
    return results
}

module.exports = {
    loadPlanetsData,
    planets,
}
