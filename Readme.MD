### Skebby Wrapper for NodeJS

## Installation

Install the dependencies

`npm install`

Create a `.skebby-config.json` file in the root path where you will put your skebby credentials. 

You can see an example in the file `.skebby-config-example.json`

## Example

```
var Skebby = require('node-skebby');

var s = new Skebby();
s.addRecipient('393396803445');
s.addRecipient('39339680344444');

s.addRecipient(['12341341414', '34542542545']);
s.setMessage('Hello World!');

s.send(function(err,data) {
  console.log(err, data);
});

```