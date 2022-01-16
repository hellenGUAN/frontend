export function setStartMonth(startMonth) {
  return {
    type: 'SET_START_MONTH',
    startMonth,
  }
}

export function setEndMonth(endMonth) {
  return {
    type: 'SET_END_MONTH',
    endMonth,
  }
}
