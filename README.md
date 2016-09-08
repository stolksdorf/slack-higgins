# higgins
A Slackbot for my personal slack. [List of Custom Integrations](https://coolsville.slack.com/apps/manage/custom-integrations), [Command List](https://coolsville.slack.com/apps/manage/A0F82E8CA-slash-commands)


### Add a new command

1. [Head here](https://coolsville.slack.com/apps/new/A0F82E8CA-slash-commands) and fill out the info
2. The url is `http://slack-higgins.herokuapp.com/[YOUR COMMAND]`, eg. `http://slack-higgins.herokuapp.com/coolcmd`
4. Give it whatever name and Icon you like
4. Hit "Save Integration"!
3. Create a new file in the `cmds` folder named `[YOUR COMMAND].cmd.js`, eg. `coolcmd.cmd.js`
4. Follow this starting template

```javascript
module.exports = {
  url : '/coolcmd',
  handle : function(msg, info, reply){
	reply('Hello' + info.sender + ', you said ' + msg);
  }
}
```

Commit your changes and LogBot will tell you when the server has restarted in the `diagnostics` channel



### Add a new bot
1. Create a new file in the `bots` folder named `[YOUR BOT].bot.js`, eg. `testbot9000.bot.js`
1. Follow this starting template

```javascript
module.exports = {
  name : 'AwesomeBot', //Optional
  icon : ':robot_face:', //Optional
  channel : '*', //Every channel, or listen in on a specific channel
  handle : function(msg, info, Higgins){
    Higgins.reply("Hey " + info.user)
  }
}
```

Commit your changes and LogBot will tell you when the server has restarted in the `diagnostics` channel

`handle` is a function that takes 3 parameters.

* `msg` will be a string that is the message from the event (if there is one)
* `info` will be an object with a bunch of data about the event. `info.channel`, `info.user`, etc.
* `Higgins` will be your best friend. He has two functiosn you can use `reply` and `react`.
  * `reply` takes a string for a message as your first parameter, and you can optionally give it a seocnd parameter of a channel or user to send the message to. It defaults to the channel the original event came from.
  * `react` takes a single argument of the name of an emoji to react to the event with.





### Resources
[msg formatting](https://api.slack.com/docs/formatting)
[attachements](https://api.slack.com/docs/attachments)


