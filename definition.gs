/////////////////////////////////////////////////////////////////////////
//変数定義
const CHANNEL_TOKEN = "LINEのチャンネルトークン";

const LINE_URL = "https://api.line.me/v2/bot/message/reply";

const SPREADSHEET_KEY = "spreadsheetのID";
const SHEET = SpreadsheetApp.openById(SPREADSHEET_KEY);
const SETTINGS = SHEET.getSheetByName("settings");
const LINE_USERLIST = SHEET.getSheetByName("Account");
var to = "あなたのLINEID"




/////////////////////////////////////////////////////////////////////////