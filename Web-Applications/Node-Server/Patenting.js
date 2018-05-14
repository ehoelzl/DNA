const mailer = require('./Mail-server');
const contract = require('truffle-contract');
const Patenting_abi = require('./build/contracts/Patenting.json');
const patenting = contract(Patenting_abi);


function Patenting(provider_) {
  patenting.setProvider(provider_);
  patenting.deployed().then(instance => {
    var event = instance.NewRental();
    event.watch(function (err, res) {
      if (err)
        console.log(err);
      else {
        let rent = res.args;
        console.log(res);
        mailer.sendPatent(rent._ownerMail, rent._patentName, rent._rentee);
      }
    });
    console.log('Patenting at ' + instance.address)
  })
}


module.exports = Patenting;