var Twitter = require('twitter');

const client = new Twitter({
    consumer_key: 'iy77PEbTevF4Bpg9ibbWuEGzR',
    consumer_secret: 'r1sGVhZN8HnIYHSMtXDSRBBTXzdCl0clZis2JXCluXYdejsrlv',
    access_token_key: '978262011166511104-F7QUJqq30bqmajWTW144yK30uxWFrAZ',
    access_token_secret: 'I4GTTYBFFRBqID1DOyGRuVXojsESdYI1q3SZ4GOuMsumC'
});

module.exports = {
    tweet: function(root){
        client.post('statuses/update', {status: root},  function(error, tweet, response) {
            if(error){
                console.log(error);
            }
            else {
                console.log("Tweet published, root:", tweet.text);
                //console.log(tweet);  // Tweet body.
                //console.log(response);  // Raw response object.
            }
        });
    }
}