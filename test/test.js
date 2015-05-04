var Skebby = require('../lib/Skebby.js');

var s = new Skebby();
s.addRecipient('393396803445');
s.addRecipient('39339680344444');
s.addRecipient(['393396803444123', '3048343434343']);
s.setMessage('Hi Mike, how are you?2');

s.send(function(err,data) {
  console.log(err, data);
});

