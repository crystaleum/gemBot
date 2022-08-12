        var { exec } = require('child_process');
        let contractName = process.argv[2];
        let command = 'cp storage/'+contractName.toString()+' '+'contracts/'+contractName.toString();
        let precommand = 'rm -rf contracts/*';
        console.log(command);
       
        function removeContractFromPipeline(precommand,contractName){
          exec(precommand, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
            } else {
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                let ttlx = stderr + '\n' + stdout;
            function moveContractFromStorage(command,contractName){
                exec(command, (error, stdout, stderr) => {
                  if (error) {
                    console.error(`exec error: ${error}`);
                  }
                  console.log(`stdout: ${stdout}`);
                  console.error(`stderr: ${stderr}`);
                  let ttlx = stderr + '\n' + stdout;
                });
              }
               return moveContractFromStorage(command,contractName);
            }
          });
        }
        removeContractFromPipeline(precommand,contractName);