import {createFingerprint} from 'lesspass';

const getColor = color => {
  const colors = [
    '#000000',
    '#074750',
    '#009191',
    '#FF6CB6',
    '#FFB5DA',
    '#490092',
    '#006CDB',
    '#B66DFF',
    '#6DB5FE',
    '#B5DAFE',
    '#920000',
    '#924900',
    '#DB6D00',
    '#24FE23',
  ];
  const index = parseInt(color, 16) % colors.length;
  return colors[index];
};

const getIcon = hash => {
  const icons = [
    'hashtag',
    'heart',
    'hotel',
    'university',
    'plug',
    'ambulance',
    'bus',
    'car',
    'plane',
    'rocket',
    'ship',
    'subway',
    'truck',
    'jpy',
    'eur',
    'btc',
    'usd',
    'gbp',
    'archive',
    'area-chart',
    'bed',
    'beer',
    'bell',
    'binoculars',
    'birthday-cake',
    'bomb',
    'briefcase',
    'bug',
    'camera',
    'cart-plus',
    'certificate',
    'coffee',
    'cloud',
    'coffee',
    'comment',
    'cube',
    'cutlery',
    'database',
    'diamond',
    'exclamation-circle',
    'eye',
    'flag',
    'flask',
    'futbol-o',
    'gamepad',
    'graduation-cap',
  ];
  const index = parseInt(hash, 16) % icons.length;
  return icons[index];
};

export const getFingerprintSettings = hash => {
  return (
    hash &&
    createFingerprint(hash).then(sha256 => {
      const hash1 = sha256.substring(0, 6);
      const hash2 = sha256.substring(6, 12);
      const hash3 = sha256.substring(12, 18);
      return {
        icon1: getIcon(hash1),
        icon2: getIcon(hash2),
        icon3: getIcon(hash3),
        color1: getColor(hash1),
        color2: getColor(hash2),
        color3: getColor(hash3),
      };
    })
  );
};

export const DEFAULT_PROFILE = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  length: 16,
  counter: 1,
  version: 2,
};
