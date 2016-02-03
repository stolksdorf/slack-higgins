# butlerbot
A Slackbot for my personal slack



[Command List](https://quadrupledaters.slack.com/apps/manage/A0F82E8CA-slash-commands)


### Add a new command

1. [Head here](https://quadrupledaters.slack.com/apps/new/A0F82E8CA-slash-commands) and fill out the info
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



### Resources
[msg formatting](https://api.slack.com/docs/formatting)
[attachements](https://api.slack.com/docs/attachments)


