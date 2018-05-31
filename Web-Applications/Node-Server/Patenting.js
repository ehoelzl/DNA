const mailer = require('./Mail-server');
const contract = require('truffle-contract');
const Patenting_abi = require('../react-app/build/contracts/Patenting.json');
const patenting = contract(Patenting_abi);

class Patenting{

    constructor(provider_){
        this.event = null;
        patenting.setProvider(provider_);
        patenting.deployed().then(instance => {
            this.contractInstance = instance;
            this.newRequest = instance.NewRequest();
            this.newRequest.watch(function(err, res) {
                if (err)
                    console.log(err);
                else {
                    let request = res.args;
                    mailer.sendRequest(request._ownerMail, request._patentName, request._rentee);
                }
            })
            this.requestResponse = instance.RequestResponse();
            this.requestResponse.watch(function(err, res) {
                if (err)
                    console.log(err);
                else {
                    let response = res.args;
                    mailer.sendRequestResponse(response._requesterMail, response._patentName, response._accepted);
                }
            })
        })
    }
}
module.exports = Patenting;