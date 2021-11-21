var qrcode = require('qrcode');

exports.generateQRCode = async function (otpAuth) {

    try {
        var QRCodeImageUrl = await qrcode.toDataURL(otpAuth);
        return { image: `<img src='${QRCodeImageUrl}' alt='qr-code-img' />` };
    } catch (error) {
        console.log('Could not generate QR code', error);
        return;
    }

};
