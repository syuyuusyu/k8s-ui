let kknd = `BQMZX210381161639291080132701,474.28,孙大富,1236903936,2021-3-22 14:01:50`.split(',')


let str = `{"bankno": "","banktransno":"${kknd[0]}","machineno":"450905","cost":${kknd[1]},"type":"1","sourceType":"1","banktransnoBase":"${kknd[0]}", "balancedateBase": "${kknd[4]}", "balancedate": "${kknd[04]}", "cardNo": "${kknd[3]}", "markNo": "", "clinicNo": "${kknd[03]}", "transType": "1", "reserved1": "", "reserved2": "", "reserved3": "", "name": "${kknd[2]}", "payMode": "BQM" }#`

console.log(str)



