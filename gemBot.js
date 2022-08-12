process.env["NTBA_FIX_319"] = 1;
var express = require('express');
var timeout = require('connect-timeout');
const axios = require('axios');
const fs = require('fs');
var answerCallbacks = {};
var port = process.env.PORT ? process.env.PORT : 4002;
// Turn the lights on
var app = express();
// Route for home
app.get("/", (req, res) => res.json("OK"));
// Load Telegram
var TelegramBot = require('node-telegram-bot-api');
// Tokenize
const token = process.env.SECRET;
// Establish bot
const bot = new TelegramBot(token, {polling: true});
// Establish time
var timeAgo = require('time-ago');

// Bot commands
var botCommands = {
    start: "/start",
    configure: "/configure",
    compile: "/compile",
    deploy: "/deploy"
}
if (botCommands) {
    Object.assign(botCommands, botCommands);
}

// Bot helper text
var { exec } = require('child_process');
let description = "Hello Deployer, ";
let by = "Guardians of the Interchained";
let compileText = "Compiling Contracts";
let deployText = "Migrations Started";
var network = process.argv[3] ? process.argv[3] : '';
var action = process.argv[4] ? process.argv[4] : '';
var contractName = process.argv[5] ? process.argv[5] : '';
var contractAddress = process.argv[6] ? process.argv[6] : '';
var infura = process.argv[7] ? process.argv[7] : '';
var infuraURL = infura == 'ropsten' ? "wss://ropsten.infura.io/ws/v3/733a7efe57364ffd9210b582d7cd0cb3" : infura == 'mainnet' ? "wss://ropsten.infura.io/ws/v3/733a7efe57364ffd9210b582d7cd0cb3" : "wss://ropsten.infura.io/ws/v3/733a7efe57364ffd9210b582d7cd0cb3";
var networkURI = network == 'ropsten' ? "api-ropsten" : network == 'mainnet' ? 'api' : 'api';
var contractAddress = contractAddress ? contractAddress : '0x77124b96a355dab9562027103df8132c81650bef';
var etherscanApiKey = network == 'ropsten' ? 'API_KEY_ROPSTEN' : network == 'mainnet' ? 'API_KEY_MAINNET' : '45AQ1EIWA552SFI5KCM6W5IZHYJB1TEKQ3';
var contractsDirectory = 'contracts/';
var contractsStorageDirectory = 'storage/';
var filePassword = 'lock&key';
var contractName = "";

async function importCA(msg,pastebin,contractName){
  var command = 'curl '+pastebin+' > '+contractsDirectory+contractName;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      let ttlerr = "Check details below and try again. "+'\n'+"There was an error reported from server:" + '\n' + '\n' + error;
      return bot.sendMessage(msg.chat.id, ttlerr);
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    let ttlx = stderr + '\n' + stdout;
    return bot.sendMessage(msg.chat.id, ttlx);
  });
};

async function compile(msg, network){
  var command = 'node ./node_modules/truffle/build/cli.bundled.js' + ' ' + 'compile';
  if(!network || network === ''){
    var options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Testnet (ropsten)', callback_data: '6' }],
          [{ text: 'Mainnet (ethereum)', callback_data: '7' }]
        ]
      })
    };
    return bot.sendMessage(msg.chat.id, "Select a Network", options);
  }
  // run
  exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        let ttlerr = "Check details below and try again. "+'\n'+"There was an error reported from server:" + '\n' + '\n' + error;
        return bot.sendMessage(msg.chat.id, ttlerr, options);
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      let ttlx = stderr + '\n' + stdout;
      return bot.sendMessage(msg.chat.id, ttlx, options);
    });
}

async function deploy(msg, contractName, network){
  var command = 'node ./node_modules/truffle/build/cli.bundled.js --network' + ' ' + network + ' ' + 'migrate';

  // run
  exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        let ttlerr = "Check details below and try again. "+'\n'+"There was an error reported from server:" + '\n' + '\n' + error;
        return bot.sendMessage(msg.chat.id, ttlerr);
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      let ttlx = stderr + '\n' + stdout;
      return bot.sendMessage(msg.chat.id, ttlx);
    });
}

async function verify(msg, network, contractName, contractAddress){
  var command = 'node ./node_modules/truffle/build/cli.bundled.js --network' + ' ' + network + ' ' + 'verify' + ' ' + contractName + '@' + contractAddress;

  // run
  exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        let ttlerr = "Check details below and try again. "+'\n'+"There was an error reported from server:" + '\n' + '\n' + error;
        return bot.sendMessage(msg.chat.id, ttlerr, options);
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      let ttlx = stderr + '\n' + stdout;
      
      var options = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: 'Try again to Verify Contract', callback_data: '5' }]
          ]
        })
      };
      return bot.sendMessage(msg.chat.id, ttlx, options);
    });
}

async function run(msg, network, action, contractName, contractAddress, etherscanApiKey){
  let compiled = await compile(msg, network, action);
  let deployed = false;
  if(compiled == true) {
    deployed = await deploy(msg, network);
  }
  let verified = false;
  if(deployed == true){
    verified = await verify(msg, network, action, contractName);
  }
}
// Grab telegram Object and handle it back
bot.onText(new RegExp('^'+botCommands['start'], 'i'), (msg, match) => {
    if(msg.from.username==msg.chat.username){
        var options = {
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [{ text: 'Import', callback_data: '1' }],
                [{ text: 'Select', callback_data: '2' }],
                [{ text: 'Compile', callback_data: '3' }],
                [{ text: 'Deploy', callback_data: '4' }],
                [{ text: 'Verify', callback_data: '5' }]
              ]
            })
        };
      bot.sendMessage(msg.chat.id, description, options);
    } else {
      console.log("\n"+"chat message: ");
      console.log(msg.chat);
      console.log("\n"+"chat ID: ");
      console.log(msg.chat.id);
      console.log("\n"+"chat object: ");
      console.log(msg);
      console.log('Start request from @%s (%s)', [msg.from.username, msg.from.id]);
      var response = 'Hello Deployer, ';
      bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    }
});

// Grab telegram Object and handle it back
bot.onText(new RegExp('^'+botCommands['test'], 'i'), (msg, match) => {
    if(msg.from.username==msg.chat.username){
      run(network, action, contractName, contractAddress, etherscanApiKey);
      bot.sendMessage(msg.chat.id, compileText);
    } else {
      console.log("\n"+"chat message: ")
      console.log(msg.chat)
      console.log("\n"+"chat ID: ")
      console.log(msg.chat.id)
      console.log("\n"+"chat object: ")
      console.log(msg)
      // log('info', logSystem, 'Pool statistics request from @%s (%s)', [msg.from.username, msg.from.id]);
      console.log('Start request from @%s (%s)', [msg.from.username, msg.from.id]);
      var response = 'Hi @' + msg.from.username + ',\n\n' + 'Here are some commands you can use, PM the bot for more intel:\n\n' + 'Help: ' + botCommands['help'] + '\n' + 'Thank you!';
      bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    }
});
  
// Grab telegram Object and handle it back
bot.onText(new RegExp('^'+botCommands['deploy'], 'i'), (msg, match) => {
    if(msg.from.username==msg.chat.username){
      bot.sendMessage(msg.chat.id, deployText);
    } else {
      console.log("\n"+"chat message: ")
      console.log(msg.chat)
      console.log("\n"+"chat ID: ")
      console.log(msg.chat.id)
      console.log("\n"+"chat object: ")
      console.log(msg)
      // log('info', logSystem, 'Pool statistics request from @%s (%s)', [msg.from.username, msg.from.id]);
      console.log('Start request from @%s (%s)', [msg.from.username, msg.from.id]);
      var response = 'Hi @' + msg.from.username + ',\n\n' + 'Here are some commands you can use, PM the bot for more intel:\n\n' + 'Help: ' + botCommands['help'] + '\n' + 'Thank you!';
      bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    }
});
  
bot.on('message', function (message) {
    var callback = answerCallbacks[message.chat.id];
    if (callback) {
        delete answerCallbacks[message.chat.id];
        return callback(message);
    }
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  let message = msg;
  console.log(msg);
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  let text;
  if (action === '1') {
    text = 'Are you there? Reply to get started...';
    var options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Import', callback_data: '1' }]
        ]
      })
    };
    if(!contractName || contractName === '' || !pastebin || pastebin === ''){
      answerCallbacks[message.chat.id] = function (answer) {
        var ca = answer.text;
        console.log(ca);filePassword
        bot.sendMessage(message.chat.id, "Enter Contract Name").then(function () {
          answerCallbacks[message.chat.id] = function (answer) {
              var contractName = answer.text;
              bot.sendMessage(message.chat.id, "Enter Contract Pastebin URL").then(function () {
                  answerCallbacks[message.chat.id] = function (answer) {
                    var pastebinURL = answer.text;
                    bot.sendMessage(message.chat.id, "Enter Password (directory security)").then(function () {
                      answerCallbacks[message.chat.id] = function (answer) {
                        var passwordToMatch = answer.text;
                        if(passwordToMatch.toString() != filePassword.toString()){
                          return bot.sendMessage(msg.chat.id, "Wrong Password", options);
                        }
                        answerCallbacks = {};
                        return importCA(msg,pastebinURL,contractName);
                      }
                    });
                  }
              });
          }
        });
      };
    }
  } else if (action === '2') {
    text = 'Would you like to check the contracts list?';
    const contractStorageDirectory = 'storage';
    let contractsInStorage = [];
    answerCallbacks[message.chat.id] = function (answer) {
      var ca = answer.text;
      console.log(ca);
      fs.readdirSync(contractStorageDirectory).forEach(contracts => {
        console.log(contracts);
        contractsInStorage.push(contracts);
        bot.sendMessage(msg.chat.id, contracts);
      });
        bot.sendMessage(message.chat.id, "Enter Contract Name").then(function () {
          answerCallbacks[message.chat.id] = function (answer) {
            contractName = answer.text;
            let precommand = 'mv contracts/'+'*'+' '+'storage/';
            let command = 'mv storage/'+contractName+' '+'contracts/'+contractName;
            async function moveContractFromStorage(precommand,contractName){
              exec(command, (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                let ttlx = stderr + '\n' + stdout;
                return bot.sendMessage(msg.chat.id, ttlx);
              });
            }
            async function moveContractsToStorage(command,contractName){
              exec(command, (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                } else {
                  if(stdout) {
                    moveContractFromStorage(command,contractName);
                  }
                }
              });
            }
            moveContractsToStorage(precommand,contractName);
            var options = {
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [{ text: 'Testnet (ropsten)', callback_data: '9' }],
                  [{ text: 'Mainnet (ethereum)', callback_data: '10' }]
                ]
              })
            };
            bot.sendMessage(message.chat.id, "Select a Network for Deployment", options);
          }
        });
    };
  } else if (action === '3') {
    text = 'Compiling Contract';
    return compile(msg,network);
  } else if (action === '4') {
    text = 'Deploying Contract';
    network = 'ropsten';
    infuraURL = 'ropsten';
    networkURI = 'ropsten';
    if(!contractName || contractName === ''){
      return bot.sendMessage(message.chat.id, "Error, no contract name.",)
    }
    return deploy(msg,contractName,network);
  } else if (action === '5') {
    text = 'Verifying Contract';
    return verify(msg,network, contractName, contractAddress);
  } else if (action === '6') {
    text = 'Compiling Contract';
    network = 'ropsten';
    infuraURL = 'ropsten';
    networkURI = 'ropsten';
    return compile(msg,network);
  } else if (action === '7') {
    text = 'Verifying Contract';
    network = 'mainnet';
    infuraURL = 'mainnet';
    networkURI = 'mainnet';
    return compile(msg,network);
  } else if (action === '8') {
    network = 'ropsten';
    infuraURL = 'ropsten';
    networkURI = 'ropsten';
    text = 'Deploying Contract to'+ " "+network;
    if(!contractName || contractName === ''){
      return bot.sendMessage(message.chat.id, "Error, no contract name.",)
    }
    return deploy(msg,contractName,network);
  } else if (action === '9') {
    network = 'ropsten';
    infuraURL = 'ropsten';
    networkURI = 'ropsten';
    text = 'Deploying Contract to'+ " "+network;
    if(!contractName || contractName === ''){
      return bot.sendMessage(message.chat.id, "Error, no contract name.",)
    }
    return deploy(msg,contractName,network);
  } else if (action === '10') {
    network = 'mainnet';
    infuraURL = 'mainnet';
    networkURI = 'mainnet';
    text = 'Deploying Contract to'+ " "+network;
    if(!contractName || contractName === ''){
      return bot.sendMessage(message.chat.id, "Error, no contract name.",)
    }
    return deploy(msg,contractName,network);
  } else { return; }

  bot.editMessageText(text, opts);
});

bot.on('polling_error', (error) => {
    console.log(error);
});

var listener = app.listen(port, function() {
    console.log('Express server listening on port', port)
});
