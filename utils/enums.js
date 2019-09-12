const profileListForUser = [
  { id: 1, name: '我的订阅', img: ''},
  { id: 2, name: '申请开户', img: ''},
  { id: 3, name: '帮助中心', img: ''}
  ];
const measFormatType = {
  NUMBER: 'f',
  SCIENCE: 'e',
  PERCENT: '%',
  WAN: 'w',
  YI: 'y',
  ZI: 'z',
  INT: '.0f'
}

module.exports = {
  profileListForUser: profileListForUser,
  measFormatType: measFormatType
}
