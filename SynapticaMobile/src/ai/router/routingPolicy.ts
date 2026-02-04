import {MODELS, ModelProfile} from './modelProfiles'
import {TaskComplexity} from './taskComplexity'

export function selectModel(complexity: TaskComplexity): ModelProfile {
  switch (complexity) {
    case 'trivial':
      return MODELS.FAST
    case 'standard':
      return MODELS.SMART
    case 'deep':
      return MODELS.DEEP
    default:
      return MODELS.FAST
  }
}
