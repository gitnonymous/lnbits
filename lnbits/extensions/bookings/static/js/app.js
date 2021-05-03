function inBetweenDates(p){
  let startDate = moment(p.startDate), endDate = moment(p.endDate),
  now = startDate.clone(), dates = [];
  while (now.isSameOrBefore(endDate)) {
      dates.push(now.format('yy/MM/DD'));
      now.add(1, 'days');
  }
  return dates;
}


