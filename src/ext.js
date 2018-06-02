const nem = require("nem-sdk").default
const qrcode = require("qrcode")
let endpoint=nem.model.objects.create("endpoint")("https://kohkei.supernode.me", 7891);
let retVal;
let win;
let ext = {
  send(amount,scheme, address){
    this.openMonya(`${scheme}:${address}?amount=${amount}`)
  },
  openMonya(param){
    win=window.open("https://monya-wallet.github.io/wallet/?url="+encodeURIComponent(param),"monya","menubar=no,location=no,resizable=yes,scrollbars=yes,status=no")
  },

  getBalance(address,callback){
    nem.com.requests.account.data(endpoint,address).then(bal=>{
      retVal=bal.account.balance
      callback(retVal)
    })
  },

  getOwnedMosaics(address,callback){
    nem.com.requests.account.mosaics.owned(endpoint,address).then(bal=>{
      retVal=bal.data
      callback(retVal)
    })
  },
  sendXEM(amount,dest,privHex,callback){
    const common =nem.model.objects.get("common")
    common.privateKey = privHex
    const transferTransaction = nem.model.objects.get("transferTransaction")
    transferTransaction.recipient=dest
    transferTransaction.amount=parseFloat(amount)
    const ent=nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, nem.model.network.data.mainnet.id);
    nem.model.transactions.send(common, ent, endpoint).then(function(res){
			retVal=res.code >= 2
      callback(retVal)
		}, function(err) {
			retVal=false
      callback(retVal)
		});
  },
  getAddressFromPrivHex(privHex){
    return nem.model.address.toAddress(nem.crypto.keyPair.create(privHex).publicKey.toString(),nem.model.network.data.mainnet.id)
  },
  getHash(data,alg){
    const sum = require('crypto').createHash(alg);
    sum.update(data); // ここの引数にハッシュを計算したい文字列を渡す
    return sum.digest('hex');
  },
  getRetVal(){
    return retVal
  },
  getRetValKey(key){
    let ret=retVal
    key.split(".").forEach(r=>{
      ret=ret[r]
    })
    return ret
  },
  getQRCode(u){
    qrcode.toDataURL(u,{
        errorCorrectionLevel: 'M',
        type: 'image/png'
      },(err,url)=>{
        const a=window.open('about:blank')
        a.document.write("<img src='" + url + "'/>");
      })
  }
}

export { ext }
