
const response = [
    {
      id: 1293487,
      name: "KCRW",  // radio station callsign
      tracks: [{ timestp: "2021-04-08", trackName: "Peaches" }]
    },
    {
      id: 12923,
      name: "KQED",
      tracks: [
        { timestp: "2021-04-09", trackName: "Savage" },
        { timestp: "2021-04-09", trackName: "Savage (feat. Beyonce)" },
        { timestp: "2021-04-08", trackName: "Savage" },
        { timestp: "2021-04-08", trackName: "Savage" },
        { timestp: "2021-04-08", trackName: "Savage" }
      ]
    },
    {
      id: 4,
      name: "WNYC",
      tracks: [
        { timestp: "2021-04-09", trackName: "Captain Hook" },
        { timestp: "2021-04-08", trackName: "Captain Hook" },
        { timestp: "2021-04-07", trackName: "Captain Hook" }
      ]
    }
  ];


const convertData = ( responses ) => 
{ 
    // initialize data object to keep track of timestmp and tracks
    data = {}; 

    // iterate through responses array 
    for (let r = 0; r < responses.length; r++)
    {

      let tracks = responses[r].tracks; 

      // iterate through track names
      for (let track = 0; track < tracks.length; track++)
      {
        // set timestmp and track names 
        let timestp = tracks[track].timestp; 
        let trackName = tracks[track].trackName; 

        // if new timestmp found, initialize empty object for tracks played on date
        if (!(timestp in data))
        {
          data[timestp] = {}; 
        }

        // if new track found for data, add to object and initialize count to 1
        // else add to count 
        if (!(trackName in data[timestp]))
        {
          data[timestp][trackName] = 1; 
        }
        else
        {
          data[timestp][trackName] += 1; 
        }

      }
    }
    
    // initialize output array 
    const arr = []; 

    // sort dates in order 
    const keys = Object.keys(data).sort() 

    // iterate through dates in order 
    for (let i = 0; i < keys.length; i++)
    {
      // set date and spins object 
      let date = keys[i]; 
      let spins = data[date]; 

      // initialize tooltip and totalspins 
      let tooltip = ""; 
      let total_spins = 0; 

      // iterate through spins and add to total_spins and tool_tip 
      for (const track in spins)
      {
        let number_of_spins = spins[track];
        tooltip = tooltip + `${track} (${number_of_spins}), `
        total_spins += spins[track];
      }

      // create object 
      let obj = {
          x: date, 
          y: total_spins,
          tooltip: tooltip.slice(0, tooltip.length - 2)
      }

      // add to output array 
      arr.push(obj); 
    }

    return arr
}

console.log(convertData(response)); 