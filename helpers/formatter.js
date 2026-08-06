const phoneNumberFormatter = function (number) {
  // 1. Menghilangkan karakter selain angka
  let formatted = number.replace(/\D/g, '');

  // 2. Menghilangkan angka 0 di depan (prefix)
  //    Kemudian diganti dengan 62
  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.substr(1);
  }

  if (!formatted.endsWith('@c.us')) {
    formatted += '@c.us';
  }

  return formatted;
}
const phoneNumberNormalizer = function (number) {
  let nomor = number.split('@')[0];

  // Ganti awalan '62' dengan '0'
  if (nomor.startsWith('62')) {
    nomor = '0' + nomor.slice(2);
    return nomor;
  }
}


module.exports = {
  phoneNumberFormatter,
  phoneNumberNormalizer
}