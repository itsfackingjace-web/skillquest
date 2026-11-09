// ---------------------------------------------------------------- BOOT LOAD
// Every section has registered its part of applySave by now, so one call restores the whole game
// (the same path a save from your account takes).
if(BOOT_LOCAL){try{applySave(JSON.parse(JSON.stringify(BOOT_LOCAL)))}catch(e){console.error(e)}}
