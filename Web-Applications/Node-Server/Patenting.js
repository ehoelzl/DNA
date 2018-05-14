const mailer = require('./Mail-server');
const contract = require('truffle-contract');
const Patenting_abi = require('./build/contracts/Patenting.json');
const patenting = contract(Patenting_abi);

class Patenting{

    constructor(provider_){
        this.event = null;
        patenting.setProvider(provider_);
        patenting.deployed().then(instance => {
            this.contractInstance = instance;
            this.event = instance.NewRental();
        })
    }

    listen() {
        this.event.watch(function(err, res) {
            if (err)
                console.log(err);
            else {
                let rent = res.args;
                mailer.sendPatent(rent._ownerMail, rent._patentName, rent._rentee);
            }
        })
    }
}
module.exports = Patenting;