function setTrigger(){
  const HOUR = SETTINGS.getRange("B2").getValue();
  const MINUTE = SETTINGS.getRange("B3").getValue();
  const date = new Date();
  console.log(date);

  // date.setDate(date.getDate()+1);
  // date.setHours(HOUR);
  // date.setMinutes(MINUTE);
  // ScriptApp.newTrigger("main").timeBased().at(date).create();
}
