# butlerbot
A Slackbot for my personal slack. [List of Custom Integrations](https://coolsville.slack.com/apps/manage/custom-integrations)







[Command List](https://coolsville.slack.com/apps/manage/A0F82E8CA-slash-commands)


### Add a new command

1. [Head here](https://coolsville.slack.com/apps/new/A0F82E8CA-slash-commands) and fill out the info
2. The url is `http://slack-butlerbot.herokuapp.com/[YOUR COMMAND]`, eg. `http://slack-butlerbot.herokuapp.com/coolcmd`
3. Set the **Method** to `GET`
4. Give it whatever name and Icon you like
4. Hit "Save Integration"!
3. Create a new file in the `commands` folder named `[YOUR COMMAND].js`, eg. `coolcmd.js`
4. Follow this starting template

```javascript
module.exports = function(msg, info, reply){
	reply('Hello' + info.sender + ', you said ' + msg);
}
```




Commit your changes and LogBot will tell you when the server has restarted in the `diagnostics` channel



### Add a new bot
1. Create a new file in the `bots` folder named `[YOUR BOT].js`, eg. `testbot9000.js`
1. Follow this starting template

```javascript
module.exports = {
	listenFor : ['message'],
	response : function(msg, info, Higgins){
		Higgins.reply("Hey " + info.user)
	}
}
```

Commit your changes and LogBot will tell you when the server has restarted in the `diagnostics` channel

`listenFor` is a list of slack events your bot will trigger on. [Full list here](https://api.slack.com/rtm) but you probably just want to use `'message'`

`response` is a function that takes 3 parameters.

* `msg` will be a string that is the message from the event (if there is one)
* `info` will be an object with a bunch of data about the event. `info.channel`, `info.user`, etc.
* `Higgins` will be your best friend. He has two functiosn you can use `reply` and `react`.
  * `reply` takes a string for a message as your first parameter, and you can optionally give it a seocnd parameter of a channel or user to send the message to. It defaults to the channel the original event came from.
  * `react` takes a single argument of the name of an emoji to react to the event with.





### Resources
[msg formatting](https://api.slack.com/docs/formatting)
[attachements](https://api.slack.com/docs/attachments)


