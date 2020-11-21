const shell = require('shelljs');

const CronJob = require('cron').CronJob;
const job = new CronJob(
	'0 * * * *',
	function() {
		console.log("Running ")
        const output = shell.exec("date ; truffle exec scripts/serviceDaemon.js --network " + process.argv[2])
        console.log("output of shell", output)
	},
	null,
	true,
	'America/Los_Angeles'
);