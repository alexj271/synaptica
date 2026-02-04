import {ModelProfile} from './modelProfiles'

let monthlyBudget = 200
let spent = 0

export function canUseModel(_model: ModelProfile): boolean {
  if (spent > monthlyBudget) {
    return false
  }
  return true
}

export function registerSpend(amount: number) {
  spent += amount
}

export function setMonthlyBudget(amount: number) {
  monthlyBudget = amount
}

export function resetBudget() {
  spent = 0
  monthlyBudget = 200
}
