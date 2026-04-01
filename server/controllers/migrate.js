
const Election = require('../models/electionModel'); // Adjust path to your model
const Counter = require('../models/counter');       // Adjust path to your counter model

async function migrate() {
    try {
       

        // 1. Fetch all matches sorted by creation date (oldest first)
        const elections = await Election.find().sort({ createdAt: 1 });
        console.log(`Found ${elections.length} matches to update.`);

        for (let i = 0; i < elections.length; i++) {
            const election = elections[i];
            
            // Only update if fields are missing to avoid overwriting existing work
            const updateData = {};
            
            if (election.matchnumber === undefined || election.matchnumber === null) {
                updateData.matchnumber = i + 1; // Assign 1, 2, 3...
            }
            
            if (!election.matchdate) {
                updateData.matchdate = new Date(); // Sets to today's date
            }

            if (Object.keys(updateData).length > 0) {
                await Election.updateOne({ _id: election._id }, { $set: updateData });
                console.log(`Updated: ${election.title} -> Match #${updateData.matchnumber}`);
            }
        }

        // 2. Sync the Counter so next new match starts at the right number
        const totalMatches = elections.length;
        await Counter.findByIdAndUpdate(
            { _id: 'electionMatchNumber' },
            { $set: { seq: totalMatches } },
            { upsert: true }
        );
        
        console.log(`Migration complete. Counter synced to: ${totalMatches}`);
        
    } catch (error) {
        console.error('Migration failed:', error);
        
    }
}

module.exports = {migrate}