const mailer = require('./Mail-server');
const contract = require('truffle-contract');
const Patenting_abi = require('../react-app/build/contracts/Patenting.json');
const patenting = contract(Patenting_abi);

/**
 * Watch for events emitted by the Smart Contract and notify users by email of these events
 */
class Patenting {

    /**
     *
     * @param provider_
     */
    constructor(provider_){
        patenting.setProvider(provider_);
        patenting.deployed().then(instance => {
            this.contractInstance = instance;
            this.contractInstance.NewRequest().watch(function(err, res) {
                if (err)
                    console.log(err);
                else {
                    let request = res.args;
                    mailer.sendRequest(request._ownerMail, request._patentName, request._rentee);
                }
            })
            this.contractInstance.RequestResponse().watch(function(err, res) {
                if (err)
                    console.log(err);
                else {
                    let response = res.args;
                    mailer.sendRequestResponse(response._requesterEmail, response._patentName, response._accepted);
                }
            })
        })
    }
}

module.exports = Patenting;