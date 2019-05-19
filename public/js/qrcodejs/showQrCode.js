var btcAddr = document.getElementById('btcAddress').value;
var qrcode = new QRCode("qrcodeid", {
  text: btcAddr,
  width: 130,
  height: 130,
  colorDark : "#042c30",
  colorLight : "#FFFFFF",
  correctLevel : QRCode.CorrectLevel.H
});
